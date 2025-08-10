import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { schemas, validateBody } from '../middleware/validate.js';
import bcrypt from 'bcryptjs';

import Lesson from '../models/Lesson.js';
import Vocab from '../models/Vocab.js';
import Submission from '../models/Submission.js';
import Test from '../models/Test.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/me', auth, async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select('name email phone profile createdAt');
    res.json(u);
  } catch (e) { next(e); }
});

router.put('/me/learner', auth, validateBody(schemas.learnerProfile), async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.gender': req.body.gender, 'profile.comfortableLanguages': req.body.comfortableLanguages, 'profile.learningLanguage': req.body.learningLanguage, 'profile.deadline': req.body.deadline, 'profile.hoursPerDay': req.body.hoursPerDay, 'profile.hoursPerWeek': req.body.hoursPerWeek } }, { new: true });
    res.json(u.profile);
  } catch (e) { next(e); }
});

router.put('/me/tutor', auth, validateBody(schemas.tutorProfile), async (req, res, next) => {
  try {
    const u = await User.findByIdAndUpdate(req.user.id, { $set: { 'profile.gender': req.body.gender, 'profile.comfortableLanguages': req.body.comfortableLanguages, 'profile.teachingLanguages': req.body.teachingLanguages } }, { new: true });
    res.json(u.profile);
  } catch (e) { next(e); }
});

router.put('/me/password', auth, validateBody(schemas.changePassword), async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id);
    const ok = await u.comparePassword(req.body.currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
    u.password = req.body.newPassword;
    await u.save();
    res.json({ message: 'Password changed' });
  } catch (e) { next(e); }
});

router.delete('/me', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    // If tutor, remove their tests + related submissions
    const myTests = await Test.find({ tutor: userId }).select('_id');
    const testIds = myTests.map(t => t._id);
    if (testIds.length) await Submission.deleteMany({ test: { $in: testIds } });
    await Test.deleteMany({ tutor: userId });

    // Remove learner data
    await Lesson.deleteMany({ user: userId });
    await Vocab.deleteMany({ user: userId });
    await Submission.deleteMany({ learner: userId });

    // Notifications for me
    await Notification.deleteMany({ user: userId });

    // Finally user
    await User.deleteOne({ _id: userId });

    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
