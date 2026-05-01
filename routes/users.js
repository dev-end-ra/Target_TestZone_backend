import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';

const router = express.Router();

// Get logged in user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, phone, targetExam, avatar } = req.body;
    
    const updateFields = {};
    if (name !== undefined)       updateFields.name = name;
    if (phone !== undefined)      updateFields.phone = phone;
    if (targetExam !== undefined) updateFields.targetExam = targetExam;
    if (avatar !== undefined)     updateFields.avatar = avatar; // base64 or ''

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }   // Mongoose option: return the updated document
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user test history
router.get('/me/submissions', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.userId })
      .populate('testId', 'title type durationSeconds')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
