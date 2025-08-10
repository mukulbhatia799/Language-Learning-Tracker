import express from 'express';
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// List my notifications (newest first)
router.get('/', auth, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

// Mark one as read (sets read + readAt)
router.patch('/:id/read', auth, async (req, res, next) => {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { read: true, readAt: new Date() } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

// Clear ALL my notifications
router.delete('/clear', auth, async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
