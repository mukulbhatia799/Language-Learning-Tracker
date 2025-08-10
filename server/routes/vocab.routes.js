import express from 'express';
import Vocab from '../models/Vocab.js';
import { auth } from '../middleware/auth.js';
import { schemas, validateBody } from '../middleware/validate.js';

const router = express.Router();

router.post('/', auth, validateBody(schemas.vocab), async (req, res, next) => {
  try {
    const item = await Vocab.create({ ...req.body, user: req.user.id });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { language, learned, pos, q, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (language) filter.language = language;
    if (typeof learned !== 'undefined') filter.learned = learned === 'true';
    if (pos) filter.partOfSpeech = pos;
    if (q) filter.$or = [
      { term: { $regex: q, $options: 'i' } },
      { translation: { $regex: q, $options: 'i' } }
    ];

    const data = await Vocab.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Vocab.countDocuments(filter);
    res.json({ data, total });
  } catch (err) { next(err); }
});

router.put('/:id', auth, validateBody(schemas.vocab), async (req, res, next) => {
  try {
    const updated = await Vocab.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Vocab item not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const deleted = await Vocab.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Vocab item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;