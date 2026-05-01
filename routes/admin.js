import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Check Middleware
const adminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ─── STUDENT MANAGEMENT ───────────────────────────────────────

// Get all students (pending/approved/rejected)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Use $ne to also catch existing users who don't have the role field set yet
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a student and assign a Student ID
router.put('/users/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student ID is required' });

    // Check if studentId already taken
    const existing = await User.findOne({ studentId });
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(400).json({ message: `Student ID "${studentId}" is already assigned to another user` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', studentId },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Student approved', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a student
router.put('/users/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Student rejected', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── TEST MANAGEMENT ──────────────────────────────────────────

// Get all tests
router.get('/tests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new test
router.post('/tests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, type, durationSeconds, subjects, liveAt, liveUntil } = req.body;
    const test = new Test({ title, type, durationSeconds, subjects, liveAt, liveUntil });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import questions for a test
router.post('/tests/:id/questions/import', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testId = req.params.id;
    const { questions } = req.body;

    const formattedQuestions = questions.map(q => ({ ...q, testId }));
    await Question.insertMany(formattedQuestions);
    await Test.findByIdAndUpdate(testId, { $inc: { totalQuestions: formattedQuestions.length } });

    res.json({ message: `${formattedQuestions.length} questions imported successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Platform stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: { $ne: 'admin' } });
    const pendingApprovals = await User.countDocuments({ role: { $ne: 'admin' }, status: { $in: ['pending', undefined, null] }, studentId: { $exists: false } });
    const totalTests = await Test.countDocuments();
    res.json({ totalStudents, pendingApprovals, totalTests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
