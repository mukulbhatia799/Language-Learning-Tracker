import express from 'express';
import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';
import Vocab from '../models/Vocab.js';
import { auth } from '../middleware/auth.js';
import Submission from '../models/Submission.js';

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [lessonsByMonth, vocabByMonth] = await Promise.all([
      Lesson.aggregate([
        { $match: { user: userId, completedAt: { $ne: null } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Vocab.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ lessonsByMonth, vocabByMonth });
  } catch (err) {
    next(err);
  }
});

// Learner: tests solved heatmap for last N days (default 84), timezone-aware
router.get('/tests-heatmap', auth, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const days = Math.max(1, Math.min(366, Number(req.query.days) || 84));

    // Use a single timezone everywhere (configurable)
    const tz = process.env.APP_TZ || 'Europe/Amsterdam';

    // End today 23:59:59.999 in tz, start at 00:00:00 in tz (N days ago)
    const now = new Date();
    const end = new Date(now.getTime());
    end.setHours(23, 59, 59, 999);
    const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

    const data = await Submission.aggregate([
      { $match: { learner: userId, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: tz
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      days,
      counts: data
    });
  } catch (e) { next(e); }
});




export default router;