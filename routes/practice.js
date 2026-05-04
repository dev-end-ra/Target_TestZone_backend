import express from 'express';
import Question from '../models/Question.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all distinct subjects
router.get('/subjects', authMiddleware, async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get distinct chapters for a subject
router.get('/:subject/chapters', authMiddleware, async (req, res) => {
  try {
    const chapters = await Question.distinct('chapter', { subject: req.params.subject });
    res.json(chapters.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get practice questions for subject + chapter (shuffled, max 20)
router.get('/:subject/:chapter/questions', authMiddleware, async (req, res) => {
  try {
    const { subject, chapter } = req.params;
    const questions = await Question.find({
      subject: decodeURIComponent(subject),
      chapter: decodeURIComponent(chapter),
    }).select('text options correctOptionIndex solutionText questionImage subject chapter');

    // Shuffle
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 20);
    res.json(shuffled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
