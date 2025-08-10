import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import Submission from '../models/Submission.js';
import Test from '../models/Test.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.post('/:id/comment', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) return res.status(400).json({ message: 'Comment required' });
    const sub = await Submission.findById(req.params.id).populate('test');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    const test = await Test.findById(sub.test._id);
    if (!test || String(test.tutor) !== req.user.id) return res.status(403).json({ message: 'Not your test' });
    sub.comment = comment.trim();
    await sub.save();
    await Notification.create({
      user: sub.learner,
      type: 'comment',
      title: `New comment on "${test.title}"`,
      body: comment.trim(),
      meta: { submissionId: sub._id, testId: test._id }
    });
    res.json({ message: 'Comment added' });
  } catch (e) { next(e); }
});

export default router;