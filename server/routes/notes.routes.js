import express from 'express';
import { auth } from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = express.Router();

// list with filters + pagination
router.get('/', auth, async (req, res, next) => {
  try {
    const { q = '', source = '', target = '', page = 1, limit = 20 } = req.query;
    const filter = { user: req.user.id };
    if (source) filter.source = source;
    if (target) filter.target = target;
    if (q) filter.$or = [{ from: new RegExp(q, 'i') }, { to: new RegExp(q, 'i') }];

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    const [data, total] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Note.countDocuments(filter),
    ]);
    res.json({ data, total, page: p, limit: l });
  } catch (e) { next(e); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { source, target, from, to, example = '' } = req.body;
    if (!source || !target || !from || !to) return res.status(400).json({ message: 'Missing fields' });
    const doc = await Note.create({ user: req.user.id, source, target, from, to, example });
    res.status(201).json(doc);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Note already exists' });
    next(e);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { example } = req.body;
    const up = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { $set: { example } }, { new: true });
    if (!up) return res.status(404).json({ message: 'Note not found' });
    res.json(up);
  } catch (e) { next(e); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const del = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!del) return res.status(404).json({ message: 'Note not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
