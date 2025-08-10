import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { schemas, validateBody } from '../middleware/validate.js';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import crypto from 'crypto';

// Optional: Google GenAI
let genAI = null;
try {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
} catch (_) {
  // package not installed or no key; we will fail with 502 in /generate
}

const router = express.Router();

/**
 * Tutor: generate questions via Google GenAI
 * body: { sourceLanguage, targetLanguage, numQuestions, difficulty }
 * returns: [{ prompt, options: [a,b,c,d], answerIndex }]
 */

router.post('/generate', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const {
      sourceLanguage = 'English',
      targetLanguage = 'Hindi',
      numQuestions = '5',
      difficulty = 'Beginner'
    } = req.body || {};

    const n = Math.max(1, Math.min(20, parseInt(String(numQuestions).trim(), 10) || 5));
    const nonce = crypto.randomBytes(8).toString('hex');

    if (!sourceLanguage?.trim() || !targetLanguage?.trim()) {
      return res.status(400).json({ message: 'Provide both sourceLanguage and targetLanguage.' });
    }
    if (!genAI || !process.env.GOOGLE_API_KEY) {
      return res.status(502).json({ message: 'AI generation is not configured on the server.' });
    }

    // Prefer flash (higher free-tier limits). Allow override via env.
    const preferred = process.env.GENAI_MODEL || 'gemini-1.5-flash';
    const candidates = [...new Set([preferred, 'gemini-1.5-pro'])];

    const system = `You generate UNIQUE MCQs for translating from ${sourceLanguage} to ${targetLanguage}.
- Difficulty: ${difficulty}.
- Output exactly ${n} items.
- Each prompt is a word or short phrase in ${sourceLanguage}.
- Provide 4 concise options in ${targetLanguage}, exactly one correct (answerIndex 0-3).
- Avoid repeating items within a request.
- Use varied, common vocabulary.`;

    const userPrompt = `Nonce: ${nonce}
Task: Create ${n} fresh, non-repeating translation MCQs (${difficulty}) from ${sourceLanguage} to ${targetLanguage}.
Return ONLY JSON as per schema.`;

    async function callModel(modelName, temp = 0.85) {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: temp,
          topP: 0.95,
          topK: 40,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'array',
            minItems: n,
            maxItems: n,
            items: {
              type: 'object',
              properties: {
                prompt: { type: 'string' },
                options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
                answerIndex: { type: 'integer', minimum: 0, maximum: 3 }
              },
              required: ['prompt', 'options', 'answerIndex']
            }
          }
        }
      });

      const result = await model.generateContent({
        systemInstruction: system,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
      });
      const text = result?.response?.text() || '[]';

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        const m = text.match(/\[[\s\S]*\]/);
        parsed = m ? JSON.parse(m[0]) : null;
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const err = new Error('AI returned invalid data');
        err.status = 502;
        throw err;
      }
      // sanitize + shuffle options + dedupe prompts
      const seen = new Set();
      const out = [];
      const indices = [0,1,2,3];
      const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      };

      for (const q of parsed) {
        const prompt = String(q.prompt || '').trim().slice(0, 200);
        let options = Array.isArray(q.options) ? q.options.slice(0,4).map(o => String(o).trim().slice(0,100)) : [];
        let answerIndex = Number.isInteger(q.answerIndex) ? q.answerIndex : 0;
        if (!prompt || options.length !== 4) continue;

        const shufIdx = shuffle(indices);
        const shufOpts = shufIdx.map(i => options[i]);
        const newAnswer = shufIdx.indexOf(answerIndex);

        if (seen.has(prompt)) continue;
        seen.add(prompt);
        out.push({ prompt, options: shufOpts, answerIndex: newAnswer });
        if (out.length === n) break;
      }
      if (out.length !== n) {
        const err = new Error('AI returned insufficient items');
        err.status = 502;
        throw err;
      }
      return out;
    }

    // Try preferred model, then fallback. Handle 429 with retry info.
    let last429 = null;
    for (const m of candidates) {
      try {
        const qs = await callModel(m, 0.85);
        return res.json(qs);
      } catch (e) {
        // If Gemini SDK throws with 429, capture retry info and try next model
        if (e?.status === 429 || e?.statusCode === 429 || e?.statusText === 'Too Many Requests') {
          // The SDK attaches errorDetails with RetryInfo sometimes
          let retryAfterSec = 60;
          const details = e?.errorDetails;
          const retryInfo = Array.isArray(details)
            ? details.find(d => d['@type']?.includes('RetryInfo'))
            : null;
          if (retryInfo?.retryDelay) {
            const m = String(retryInfo.retryDelay).match(/(\d+)s/);
            if (m) retryAfterSec = parseInt(m[1], 10);
          }
          last429 = { model: m, retryAfterSec };
          // try next candidate
          continue;
        }
        // other errors: if first model failed, try next; else bubble
        if (m !== candidates[candidates.length - 1]) continue;
        return next(e);
      }
    }

    // If we got here, every candidate hit 429
    if (last429) {
      return res.status(429).json({
        message: `AI rate limit reached on ${last429.model}. Try again in ~${last429.retryAfterSec}s.`,
        retryAfterSec: last429.retryAfterSec
      });
    }

    // Fallback safety (shouldn’t hit)
    return res.status(502).json({ message: 'AI generation failed.' });
  } catch (e) {
    next(e);
  }
});


// Tutor: create test (can be drafted not live yet)
router.post('/', auth, requireRole('tutor'), validateBody(schemas.testCreate), async (req, res, next) => {
  try {
    const t = await Test.create({ ...req.body, tutor: req.user.id });
    res.status(201).json(t);
  } catch (e) { next(e); }
});

// Learner: list my completed tests with basic test info
router.get('/completed/mine', auth, async (req, res, next) => {
  try {
    const subs = await Submission.find({ learner: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: 'test', select: 'title language durationSec isLive' });
    const out = subs
      .filter(s => s.test)
      .map(s => ({
        submissionId: s._id,
        testId: s.test._id,
        title: s.test.title,
        language: s.test.language,
        durationSec: s.test.durationSec,
        score: s.score,
        total: s.total,
        takenAt: s.createdAt,
      }));
    res.json(out);
  } catch (e) { next(e); }
});

// Tutor: publish/unpublish test (set isLive)
router.patch('/:id/live', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const { isLive = true } = req.body || {};
    const t = await Test.findOneAndUpdate(
      { _id: req.params.id, tutor: req.user.id },
      { $set: { isLive: !!isLive } },
      { new: true }
    );
    if (!t) return res.status(404).json({ message: 'Test not found' });
    res.json(t);
  } catch (e) { next(e); }
});

// Tutor: delete a test (and its submissions)
router.delete('/:id', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const t = await Test.findOneAndDelete({ _id: req.params.id, tutor: req.user.id });
    if (!t) return res.status(404).json({ message: 'Test not found' });
    await Submission.deleteMany({ test: t._id });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

// Tutor: list my tests with submission counts
router.get('/mine', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const tests = await Test.find({ tutor: req.user.id }).sort({ createdAt: -1 });
    const testIds = tests.map(t => t._id);
    const counts = await Submission.aggregate([
      { $match: { test: { $in: testIds } } },
      { $group: { _id: '$test', count: { $sum: 1 } } }
    ]);
    const map = new Map(counts.map(c => [String(c._id), c.count]));
    res.json(tests.map(t => ({ ...t.toObject(), submissionsCount: map.get(String(t._id)) || 0 })));
  } catch (e) { next(e); }
});

// Learner: list live tests
router.get('/', auth, async (req, res, next) => {
  try {
    const { language } = req.query;
    const filter = { isLive: true };
    if (language) filter.language = language;
    const tests = await Test.find(filter)
      .sort({ createdAt: -1 })
      .populate('tutor', 'name') // 👈 add tutor name
      .select('title language durationSec tutor createdAt isLive');

    res.json(tests.map(t => ({
      _id: t._id,
      title: t.title,
      language: t.language,
      durationSec: t.durationSec,
      isLive: t.isLive,
      tutorName: t.tutor?.name || '—',
    })));
  } catch (e) { next(e); }
});


// Get a single test (without answers)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const t = await Test.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Test not found' });
    const publicQ = t.questions.map(({ prompt, options }, idx) => ({ prompt, options, index: idx }));
    res.json({ _id: t._id, title: t.title, language: t.language, durationSec: t.durationSec, questions: publicQ });
  } catch (e) { next(e); }
});

// Submit answers -> score
router.post('/:id/submit', auth, validateBody(schemas.submitAnswers), async (req, res, next) => {
  try {
    const t = await Test.findById(req.params.id);
    if (!t || !t.isLive) return res.status(400).json({ message: 'Test not available' });
    const total = t.questions.length;
    let score = 0;
    for (const a of req.body.answers) {
      const q = t.questions[a.qIndex];
      if (q && Number(a.optionIndex) === Number(q.answerIndex)) score++;
    }
    const sub = await Submission.create({ test: t._id, learner: req.user.id, answers: req.body.answers, score, total });
    res.status(201).json(sub);
  } catch (e) { next(e); }
});

// Tutor: list submissions for my test
router.get('/:id/submissions', auth, requireRole('tutor'), async (req, res, next) => {
  try {
    const t = await Test.findOne({ _id: req.params.id, tutor: req.user.id });
    if (!t) return res.status(404).json({ message: 'Test not found' });
    const subs = await Submission.find({ test: t._id })
      .populate('learner', 'name email')
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (e) { next(e); }
});

// AI health probe
router.get('/ai/health', (_req, res) => {
  res.json({ ok: !!genAI && !!process.env.GOOGLE_API_KEY });
});

export default router;