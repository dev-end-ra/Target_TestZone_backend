import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: student must be approved to access tests
const approvedStudentMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return next(); // Admins bypass
  if (user.status !== 'approved') {
    return res.status(403).json({ message: 'Your account is pending admin approval.' });
  }
  next();
};

// Get all available tests (for MockTests page)
router.get('/', authMiddleware, approvedStudentMiddleware, async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true }).sort({ liveAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mock test and its questions
router.get('/:id/questions', authMiddleware, approvedStudentMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({ testId: req.params.id });
    const test = await Test.findById(req.params.id);

    if (!test || questions.length === 0) {
      // Fallback for demo if DB is empty
      const MOCK_QUESTIONS = [
        { _id: '663200000000000000000001', subject: 'Physics', text: 'What is the SI unit of Force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correctOptionIndex: 0, marks: 4, negativeMarks: 1, solutionText: 'The SI unit of force is the Newton (N), named after Sir Isaac Newton.' },
        { _id: '663200000000000000000002', subject: 'Physics', text: 'Acceleration due to gravity on Earth is approximately?', options: ['9.8 m/s²', '10.5 m/s²', '8.9 m/s²', '11.2 m/s²'], correctOptionIndex: 0, marks: 4, negativeMarks: 1, solutionText: 'Gravity on Earth is approx 9.8 m/s². Often approximated as 10 m/s² for easier calculations.' },
        { _id: '663200000000000000000003', subject: 'Chemistry', text: 'What is the chemical formula for water?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correctOptionIndex: 0, marks: 4, negativeMarks: 1, solutionText: 'Water is H2O — 2 Hydrogen atoms bonded to 1 Oxygen atom.' },
        { _id: '663200000000000000000004', subject: 'Mathematics', text: 'What is the derivative of x²?', options: ['x', '2x', 'x²/2', '2'], correctOptionIndex: 1, marks: 4, negativeMarks: 1, solutionText: 'By the power rule: d/dx (x^n) = nx^(n-1). So d/dx (x^2) = 2x.' },
        { _id: '663200000000000000000005', subject: 'Mathematics', text: 'Value of sin(90°)?', options: ['0', '1', '-1', 'Infinity'], correctOptionIndex: 1, marks: 4, negativeMarks: 1, solutionText: 'sin(90°) = 1 by definition from the unit circle.' },
      ];
      return res.json({ title: 'MHT-CET Mock Test 1', durationSeconds: 10800, questions: MOCK_QUESTIONS });
    }

    // Check live window
    const now = new Date();
    if (test.liveAt && new Date(test.liveAt) > now) {
      return res.status(403).json({ message: 'This test has not started yet.' });
    }
    if (test.liveUntil && new Date(test.liveUntil) < now) {
      return res.status(403).json({ message: 'This test window has expired.' });
    }

    res.json({ title: test.title, durationSeconds: test.durationSeconds, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit test
router.post('/:id/submit', authMiddleware, approvedStudentMiddleware, async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body;
    const testId = req.params.id;
    const userId = req.user.userId;

    const questions = await Question.find({ testId });

    let totalScore = 0;
    let subjectScores = {};

    questions.forEach(q => {
      const userAns = answers.find(a => a.questionId.toString() === q._id.toString());
      if (!subjectScores[q.subject]) subjectScores[q.subject] = 0;

      if (userAns && userAns.selectedOptionIndex !== null) {
        if (userAns.selectedOptionIndex === q.correctOptionIndex) {
          totalScore += q.marks;
          subjectScores[q.subject] += q.marks;
        } else {
          totalScore -= q.negativeMarks;
          subjectScores[q.subject] -= q.negativeMarks;
        }
      }
    });

    const submission = new Submission({ userId, testId, answers, totalScore, subjectScores, timeTakenSeconds });
    await submission.save();
    res.json({ message: 'Test submitted successfully', submissionId: submission._id, totalScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission details for result page
router.get('/submission/:id', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('testId')
      .populate('answers.questionId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
