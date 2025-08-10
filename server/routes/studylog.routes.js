import express from 'express';
import { auth } from '../middleware/auth.js';
import { schemas, validateBody } from '../middleware/validate.js';
import StudyLog from '../models/StudyLog.js';

const router = express.Router();

router.post('/', auth, validateBody(schemas.studyLog), async (req, res, next) => {
  try {
    const { date, hours } = req.body;
    const up = await StudyLog.findOneAndUpdate(
      { user: req.user.id, date: new Date(new Date(date).toDateString()) },
      { $set: { hours } },
      { upsert: true, new: true }
    );
    res.status(201).json(up);
  } catch (e) { next(e); }
});

router.get('/summary', auth, async (req, res, next) => {
  try {
    const end = new Date();
    const start = new Date(end); start.setDate(end.getDate() - 7);
    const logs = await StudyLog.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const today = logs.find(l => new Date(l.date).toDateString() === new Date().toDateString());
    const weekTotal = logs.reduce((s, l) => s + l.hours, 0);
    res.json({ todayHours: today?.hours || 0, weekHours: weekTotal, logs });
  } catch (e) { next(e); }
});

export default router;