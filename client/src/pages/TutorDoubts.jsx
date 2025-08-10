import { useEffect, useMemo, useState } from 'react';
import * as doubtsApi from '../services/doubts';
import toast from 'react-hot-toast';

export default function TutorDoubts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await doubtsApi.inbox();
      setItems(res);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load doubts');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function reply(id) {
    const a = prompt('Type your answer:');
    if (a == null) return;
    try {
      await doubtsApi.answer(id, { answer: a });
      toast.success('Answer sent to learner');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send answer');
    }
  }

  const { open, solved } = useMemo(() => {
    const open = items.filter(d => d.status !== 'answered');
    const solved = items.filter(d => d.status === 'answered');
    return { open, solved };
  }, [items]);

  if (loading) return <div className="max-w-5xl mx-auto p-6"><div className="card">Loading…</div></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-xl font-semibold">Learner Doubts</div>

      {/* Unsolved */}
      <section className="space-y-3">
        <div className="text-lg font-semibold">Unsolved doubts</div>
        {open.length === 0 && <div className="card text-sm text-slate-300">No unsolved doubts 🎉</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {open.map(d => (
            <div key={d._id} className="card space-y-2">
              <div className="text-sm text-slate-400">
                {d.test ? <>Test: <b>{d.test.title}</b> <span className="opacity-70">({d.test.language})</span></> : 'No test selected'}
              </div>
              <div className="text-sm">From: <b>{d.learner?.name}</b> <span className="text-slate-400">{d.learner?.email}</span></div>
              <div className="font-semibold">Q: {d.question}</div>
              <div className="flex gap-2 pt-2">
                <button className="btn btn-primary" onClick={() => reply(d._id)}>Answer</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Solved */}
      <section className="space-y-3">
        <div className="text-lg font-semibold">Solved doubts</div>
        {solved.length === 0 && <div className="card text-sm text-slate-300">No solved doubts yet.</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {solved.map(d => (
            <div key={d._id} className="card space-y-2">
              <div className="text-sm text-slate-400">
                {d.test ? <>Test: <b>{d.test.title}</b> <span className="opacity-70">({d.test.language})</span></> : 'No test selected'}
              </div>
              <div className="text-sm">From: <b>{d.learner?.name}</b> <span className="text-slate-400">{d.learner?.email}</span></div>
              <div className="font-semibold">Q: {d.question}</div>
              <div className="text-emerald-300">Your answer: {d.answerTutor}</div>
              <div className="flex gap-2 pt-2">
                <button className="btn" onClick={() => reply(d._id)}>Update Answer</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
