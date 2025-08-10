import express from 'express';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { schemas, validateBody } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validateBody(schemas.register), async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({
      name, email, phone, password,
      profile: { role, comfortableLanguages: [] }
    });
    const token = signToken({ id: user._id }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.profile.role } });
  } catch (err) { next(err); }
});

router.post('/login', validateBody(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ id: user._id }, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.profile.role } });
  } catch (err) { next(err); }
});

export default router;