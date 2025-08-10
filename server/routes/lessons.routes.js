import express from 'express';
import Lesson from '../models/Lesson.js';
import { auth } from '../middleware/auth.js';
import { schemas, validateBody } from '../middleware/validate.js';

const router = express.Router();

// Create
router.post('/', auth, validateBody(schemas.lesson), async (req, res, next) => {
  try {
    const lesson = await Lesson.create({ ...req.body, user: req.user.id });
    res.status(201).json(lesson);
  } catch (err) { next(err); }
});

// Read (with filters & pagination)
router.get('/', auth, async (req, res, next) => {
  try {
    const { language, difficulty, completed, q, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    if (completed === 'true') filter.completedAt = { $ne: null };
    if (completed === 'false') filter.completedAt = null;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const docs = await Lesson.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Lesson.countDocuments(filter);
    res.json({ data: docs, total });
  } catch (err) { next(err); }
});

// Update
router.put('/:id', auth, validateBody(schemas.lesson), async (req, res, next) => {
  try {
    const updated = await Lesson.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// Delete
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const deleted = await Lesson.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;