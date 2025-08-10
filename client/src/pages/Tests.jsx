import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as testApi from '../services/tests';
import Timer from '../components/Timer';
import toast from 'react-hot-toast';

function Tabs({ tab, setTab }) {
  return (
    <div className="flex gap-2 mb-4">
      <button className={`btn ${tab==='available'?'btn-primary':''}`} onClick={()=>setTab('available')}>Available tests</button>
      <button className={`btn ${tab==='completed'?'btn-primary':''}`} onClick={()=>setTab('completed')}>Completed tests</button>
    </div>
  );
}

function ListAvailable() {
  const [tests, setTests] = useState([]);
  useEffect(() => { (async () => setTests(await testApi.listLive()))(); }, []);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {tests.map(t => (
        <a key={t._id} className="card hover:shadow-glow" href={`/tests/${t._id}`}>
          <div className="font-semibold">{t.title}</div>
          <div className="text-xs text-slate-300">
            {t.language} • {Math.round(t.durationSec/60)} min
          </div>
          <div className="text-xs text-slate-400 mt-1">Tutor: {t.tutorName || '—'}</div>
        </a>
      ))}
      {tests.length === 0 && <div className="card text-sm text-slate-300">No tests available.</div>}
    </div>
  );
}


function ListCompleted() {
  const [items, setItems] = useState([]);
  useEffect(() => { (async () => setItems(await testApi.completedMine()))(); }, []);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.submissionId} className="card">
          <div className="font-semibold">{it.title}</div>
          <div className="text-xs text-slate-300">{it.language} • {Math.round(it.durationSec/60)} min</div>
          <div className="text-sm mt-1">Score: <b>{it.score}/{it.total}</b></div>
          <div className="text-xs text-slate-400">{new Date(it.takenAt).toLocaleString()}</div>
        </div>
      ))}
      {items.length === 0 && <div className="card text-sm text-slate-300">No completed tests yet.</div>}
    </div>
  );
}

export function TestsHome() {
  const [tab, setTab] = useState('available');
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <Tabs tab={tab} setTab={setTab} />
      {tab === 'available' ? <ListAvailable /> : <ListCompleted />}
    </div>
  );
}

export function Take() {
  const { id } = useParams();
  const nav = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  useEffect(() => { (async () => setTest(await testApi.getOne(id)))(); }, [id]);

  async function submit() {
    const payload = Object.entries(answers).map(([qIndex, optionIndex]) => ({ qIndex: Number(qIndex), optionIndex }));
    const res = await testApi.submit(id, payload);
    toast.success(`Score: ${res.score}/${res.total}`);
    nav('/progress'); // send to progress so heatmap refreshes
  }

  if (!test) return null;
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{test.title}</div>
          <Timer seconds={test.durationSec} onExpire={submit} />
        </div>
      </div>
      {test.questions.map((q, idx) => (
        <div key={idx} className="card space-y-2">
          <div className="font-semibold">{idx + 1}. {q.prompt}</div>
          <div className="grid gap-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name={`q${idx}`} onChange={()=>setAnswers({...answers, [idx]: i})} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-primary" onClick={submit}>Submit</button>
    </div>
  );
}

export default function Tests() {
  // Use route-level in App.jsx: /tests -> <TestsHome />, /tests/:id -> <Take />
  return null;
}