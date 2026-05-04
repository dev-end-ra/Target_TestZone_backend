import express from 'express';
import Notification from '../models/Notification.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get my notifications (newest first, last 50)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.userId, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark one as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
