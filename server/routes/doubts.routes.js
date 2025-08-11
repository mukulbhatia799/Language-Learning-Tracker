import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';
import { emitNotification } from "../socket.js";


let genAI = null;
try {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  if (process.env.GOOGLE_API_KEY) genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} catch {}

const router = express.Router();

/** Tutors directory */
router.get('/tutors', auth, async (req, res, next) => {
  try {
    const tutors = await User.find({ 'profile.role': 'tutor' })
      .select('name email profile.teachingLanguages');
    res.json(tutors.map(t => ({
      _id: t._id, name: t.name, email: t.email,
      languages: t.profile?.teachingLanguages || []
    })));
  } catch (e) { next(e); }
});

/** Tests options: available (live) + completed for this learner */
router.get('/tests-options', auth, async (req, res, next) => {
  try {
    const live = await Test.find({ isLive: true })
      .populate('tutor', 'name')
      .select('title language tutor');

    const available = live.map(t => ({
      _id: t._id, title: t.title, language: t.language, tutorName: t.tutor?.name || '—'
    }));

    const subs = await Submission.find({ learner: req.user.id })
      .populate({ path: 'test', select: 'title language tutor', populate: { path: 'tutor', select: 'name' } })
      .sort({ createdAt: -1 });

    const completed = subs
      .filter(s => s.test)
      .map(s => ({
        _id: s.test._id,
        title: s.test.title,
        language: s.test.language,
        tutorName: s.test.tutor?.name || '—',
        submissionId: s._id,
      }));

    res.json({ available, completed });
  } catch (e) { next(e); }
});

/** Ask AI (concise answer) — stores a record for history */
router.post('/ask-ai', auth, async (req, res, next) => {
  try {
    const { question = '', testId = null } = req.body || {};
    if (!question.trim()) return res.status(400).json({ message: 'Question is required.' });

    if (!genAI || !process.env.GOOGLE_API_KEY) {
      return res.status(502).json({ message: 'AI is not configured on the server.' });
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GENAI_MODEL || 'gemini-1.5-flash',
      generationConfig: { temperature: 0.3 }
    });

    const test = testId ? await Test.findById(testId).select('title language') : null;

    const prompt = `Answer the learner's doubt concisely and to the point.
${test ? `Test: ${test.title} (${test.language})` : ''}
Question: ${question}
Instructions: Use simple, direct language. Max 5 short sentences.`;

    const result = await model.generateContent(prompt);
    const answer = (result?.response?.text() || '').trim();

    const doubt = await Doubt.create({
      learner: req.user.id,
      tutor: null,
      test: testId || null,
      question,
      answerAI: answer,
      status: 'answered'
    });

    res.status(201).json({ answer, doubtId: doubt._id });
  } catch (e) { next(e); }
});

/** Ask Tutor — creates doubt + NOTIFICATION to tutor */
router.post('/ask-tutor', auth, async (req, res, next) => {
  try {
    const { question = '', testId = null, tutorId } = req.body || {};
    if (!question.trim()) return res.status(400).json({ message: 'Question is required.' });
    if (!tutorId) return res.status(400).json({ message: 'Please choose a tutor.' });

    const tutor = await User.findOne({ _id: tutorId, 'profile.role': 'tutor' }).select('_id name');
    if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });

    const doubt = await Doubt.create({
      learner: req.user.id, tutor: tutor._id, test: testId || null,
      question, status: 'open'
    });

    // 🔔 Notify tutor
    try {
      await Notification.create({
        user: tutor._id,
        type: 'doubt',
        message: `New doubt from a learner: "${question.slice(0, 120)}"`,
        meta: { doubtId: doubt._id, learnerId: req.user.id, testId }
      });
    } catch {}

    res.status(201).json({ ok: true, doubtId: doubt._id });
  } catch (e) { next(e); }
});

/** Tutor inbox — all assigned doubts (we split client-side into open/answered) */
router.get('/inbox', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const items = await Doubt.find({ tutor: req.user.id })
      .populate('learner', 'name email')
      .populate('test', 'title language')
      .sort({ status: 1, createdAt: -1 }); // open first
    res.json(items.map(d => ({
      _id: d._id,
      question: d.question,
      answerTutor: d.answerTutor,
      status: d.status,
      createdAt: d.createdAt,
      learner: d.learner ? { _id: d.learner._id, name: d.learner.name, email: d.learner.email } : null,
      test: d.test ? { _id: d.test._id, title: d.test.title, language: d.test.language } : null,
    })));
  } catch (e) { next(e); }
});

/** (Optional) Learner history */
router.get('/mine', auth, async (req, res, next) => {
  try {
    const items = await Doubt.find({ learner: req.user.id })
      .populate('tutor', 'name email')
      .populate('test', 'title language')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

/** Tutor answers doubt — NOTIFICATION to learner */
router.post('/:id/answer', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const { answer = '' } = req.body || {};
    const doubt = await Doubt.findById(req.params.id); // keep ObjectId comparison

    if (!doubt) return res.status(404).json({ message: 'Doubt not found.' });
    if (!doubt.tutor) return res.status(400).json({ message: 'This doubt is not assigned to any tutor.' });
    if (doubt.tutor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only the assigned tutor can answer this doubt.' });
    }

    const text = String(answer || '').trim();
    if (!text) return res.status(400).json({ message: 'Answer text is required.' });

    doubt.answerTutor = text;
    doubt.status = 'answered';
    await doubt.save();

    // 🔔 Notify learner
    try {
      await Notification.create({
        user: doubt.learner,
        type: 'doubt-answered',
        message: 'Your tutor replied to your doubt.',
        meta: { doubtId: doubt._id }
      });
    } catch {}

    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/ask", auth, async (req, res) => {
  const { tutorId, question } = req.body;
  const notif = await Notification.create({
    user: tutorId,
    title: "New doubt asked",
    body: `${req.user.name} asked: ${question}`
  });

  emitNotification(tutorId, notif); // <-- real-time push
  res.json({ message: "Doubt sent" });
});

export default router;
