import { useEffect, useState } from 'react';
import { useParams, Link, useMatch } from 'react-router-dom';
import * as api from '../services/tests';
import * as subs from '../services/submissions';
import toast from 'react-hot-toast';

// ----------------- Create -----------------
function Create() {
  const [sourceLanguage, setSourceLanguage] = useState(); // "English" input
  const [targetLanguage, setTargetLanguage] = useState();   // "Hindi" input
  const [numQuestions, setNumQuestions]   = useState();         // text field
  const [difficulty, setDifficulty]       = useState('Begineer');  // dropdown
  const [durationSec, setDurationSec]     = useState();
  const [title, setTitle]                 = useState('');
  const [questions, setQuestions]         = useState([]);
  const [loadingGen, setLoadingGen]       = useState(false);

  function parseCount(s) {
    const n = parseInt(String(s).trim(), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 1), 20) : 5;
    // clamps between 1..20
  }

  async function generate() {
    const n = parseCount(numQuestions);
    if (!sourceLanguage.trim() || !targetLanguage.trim()) {
      return toast.error('Please fill both source & target languages.');
    }
    setLoadingGen(true);
    try {
      const qs = await api.generate({
        sourceLanguage,
        targetLanguage,
        numQuestions: String(n),
        difficulty,
      });
      setQuestions(qs);
      if (!title.trim()) setTitle(`${sourceLanguage} → ${targetLanguage} (${difficulty})`);
      toast.success('Questions generated (AI)');
    } catch (e) {
      // 👇 stop masking with demo; surface the real error
      toast.error(e?.response?.data?.message || 'AI generation failed. Check your server key/setup.');
    } finally {
      setLoadingGen(false);
    }
  }


  function editQ(qi, patch) {
    const qs = [...questions];
    qs[qi] = { ...qs[qi], ...patch };
    setQuestions(qs);
  }

  async function startTest() {
    if (!title.trim()) return toast.error('Add a title');
    if (!questions.length) return toast.error('Generate or add questions first');
    try {
      await api.create({ title, language: `${sourceLanguage}→${targetLanguage}`, durationSec, questions, isLive: true });
      toast.success('Test published! Learners can now see it.');
      // reset
      // setSourceLanguage('English'); setTargetLanguage('Hindi'); setNumQuestions('5');
      // setDifficulty('Beginner'); setDurationSec(300); setTitle(''); setQuestions([]);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create test');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="text-xl font-semibold">Create Test</div>

      <div className="card grid gap-3 md:grid-cols-2">
        <input className="input" placeholder="Source language (e.g., English)" value={sourceLanguage} onChange={e=>setSourceLanguage(e.target.value)} />
        <input className="input" placeholder="Target language (e.g., Hindi)"   value={targetLanguage} onChange={e=>setTargetLanguage(e.target.value)} />

        {/* number of questions as TEXT input */}
        <input className="input" placeholder="Number of questions (1-20)" value={numQuestions} onChange={e=>setNumQuestions(e.target.value)} />

        {/* difficulty dropdown */}
        <select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          <option>Beginner</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        {/* duration still numeric */}
        <input className="input" type="number" min="30" step="30" placeholder="Test Duration (sec)" value={durationSec} onChange={e=>setDurationSec(Number(e.target.value))} />

        <button className="btn btn-primary md:col-span-2" onClick={generate} disabled={loadingGen}>
          {loadingGen ? 'Generating…' : 'Generate Questions (AI)'}
        </button>
      </div>

      <div className="card space-y-3">
        <input className="input" placeholder="Test Title" value={title} onChange={e=>setTitle(e.target.value)} />
        {!questions.length && <div className="text-sm text-slate-300">No questions yet — click “Generate Questions (AI)”.</div>}
        {questions.map((q, qi) => (
          <div key={qi} className="card space-y-2">
            <input className="input" value={q.prompt} onChange={e=>editQ(qi, { prompt: e.target.value })} />
            {q.options.map((op, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  value={op}
                  onChange={e=>{
                    const opts = [...q.options]; opts[oi] = e.target.value; editQ(qi, { options: opts });
                  }}
                />
                <label className="text-xs">
                  <input type="radio" checked={q.answerIndex === oi} onChange={()=>editQ(qi, { answerIndex: oi })} /> Correct
                </label>
              </div>
            ))}
          </div>
        ))}
        <button className="btn btn-primary" onClick={startTest}>Start Test (Publish)</button>
      </div>

      <div className="card">
        <Link to="/tests/manage" className="underline">Manage my tests</Link>
      </div>
    </div>
  );
}

// ----------------- ManageList & ManageOne stay the same -----------------
function ManageList() {
  const [tests, setTests] = useState([]);
  async function load() {
    try { setTests(await api.mine()); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed to load tests'); }
  }
  useEffect(() => { load(); }, []);

  async function del(id) {
    if (!confirm('Delete this test? This will remove all submissions.')) return;
    try { await api.remove(id); toast.success('Test deleted'); await load(); }
    catch (e) { toast.error(e?.response?.data?.message || 'Delete failed'); }
  }
  async function unpublish(id) { try { await api.setLive(id, false); toast.success('Test unpublished'); await load(); } catch (e) { toast.error(e?.response?.data?.message || 'Unpublish failed'); } }
  async function publish(id)   { try { await api.setLive(id, true);  toast.success('Test published');   await load(); } catch (e) { toast.error(e?.response?.data?.message || 'Publish failed');   } }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="text-xl font-semibold">Manage My Tests</div>
      {tests.length === 0 && <div className="card text-sm text-slate-300">No tests yet.</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {tests.map(t => (
          <div key={t._id} className="card space-y-2">
            <div className="font-semibold">{t.title}</div>
            <div className="text-xs text-slate-300">{t.language} • {Math.round(t.durationSec/60)} min</div>
            <div className="text-sm">Completed: <b>{t.submissionsCount}</b></div>
            <div className="flex gap-2">
              {t.isLive
                ? <button className="btn" onClick={()=>unpublish(t._id)}>Unpublish</button>
                : <button className="btn btn-primary" onClick={()=>publish(t._id)}>Publish</button>}
              <Link to={`/tests/manage/${t._id}`} className="btn">Submissions</Link>
              <button className="btn" onClick={()=>del(t._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManageOne() {
  const { id } = useParams();
  const [subsList, setSubsList] = useState([]);
  async function load() {
    try { setSubsList(await api.submissionsFor(id)); }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed to load submissions'); }
  }
  useEffect(() => { load(); }, [id]);

  async function leaveComment(subId) {
    const c = prompt('Comment (e.g., "Keep it up!")');
    if (!c) return;
    try {
      await subs.comment(subId, c);
      toast.success('Comment added & learner notified');
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add comment');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="text-xl font-semibold">Submissions</div>
      {subsList.length === 0 && <div className="card text-sm text-slate-300">No submissions yet.</div>}
      {subsList.map(s => (
        <div key={s._id} className="card">
          <div className="font-semibold">{s.learner?.name} • {s.score}/{s.total}</div>
          <div className="text-xs text-slate-300">{new Date(s.createdAt).toLocaleString()}</div>
          <div className="mt-2 text-sm">Comment: {s.comment || '—'}</div>
          <button className="btn mt-2" onClick={() => leaveComment(s._id)}>Add/Update Comment</button>
        </div>
      ))}
    </div>
  );
}

export default function TestsManage() {
  const matchCreate = useMatch('/tests/create');
  const matchOne = useMatch('/tests/manage/:id');
  const matchManage = useMatch('/tests/manage');

  if (matchCreate) return <Create />;
  if (matchOne) return <ManageOne />;
  if (matchManage) return <ManageList />;
  return <ManageList />;
}