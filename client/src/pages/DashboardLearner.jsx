import { useEffect, useState } from 'react';
import * as study from '../services/studylog';
import * as tests from '../services/tests';

export default function DashboardLearner() {
  const [sum, setSum] = useState({ todayHours: 0, weekHours: 0, logs: [] });
  const [liveTests, setLiveTests] = useState([]);

  async function load() {
    setSum(await study.summary());
    setLiveTests(await tests.listLive());
  }
  useEffect(() => { load(); }, []);

  async function logToday(e) {
    e.preventDefault();
    const hours = Number(new FormData(e.currentTarget).get('hours') || 0);
    await study.upsert({ date: new Date().toISOString(), hours });
    await load();
    e.currentTarget.reset();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card"><div className="text-sm">Today</div><div className="text-3xl font-bold">{sum.todayHours} h</div></div>
        <div className="card"><div className="text-sm">This Week</div><div className="text-3xl font-bold">{sum.weekHours} h</div></div>
        <form className="card flex items-end gap-3" onSubmit={logToday}>
          <div className="flex-1">
            <div className="text-sm mb-2">Log study hours (today)</div>
            <input name="hours" className="input" type="number" min="0" step="0.5" placeholder="e.g., 1.5" required />
          </div>
          <button className="btn btn-primary">Save</button>
        </form>
      </div>

      <div className="card">
        <div className="text-lg font-semibold mb-2">Live Tests</div>
        {liveTests.length === 0 && <div className="text-sm text-slate-300">No tests right now.</div>}
        <div className="grid md:grid-cols-3 gap-4">
          {liveTests.map(t => (
            <a key={t._id} className="card hover:shadow-glow" href={`/tests/${t._id}`}>
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-slate-300">{t.language} • {Math.round(t.durationSec/60)} min</div>
            </a>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="text-lg font-semibold mb-2">Recent Study (7 days)</div>
        <div className="text-sm text-slate-300">
          {sum.logs.map(l => <div key={l._id}>{new Date(l.date).toLocaleDateString()} — {l.hours} h</div>)}
        </div>
      </div>
    </div>
  );
}
