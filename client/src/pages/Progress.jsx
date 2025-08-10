import { useEffect, useMemo, useState, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { testsHeatmap } from '../services/progress';

function colorFor(v, max) {
  if (v <= 0) return 'bg-slate-800';
  const q = Math.min(1, v / Math.max(1, max));
  if (q < 0.25) return 'bg-emerald-900';
  if (q < 0.5)  return 'bg-emerald-700';
  if (q < 0.75) return 'bg-emerald-500';
  return 'bg-emerald-300';
}

export default function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  if (user?.role === 'tutor') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="card">Progress page is for learners only.</div>
      </div>
    );
  }

  const load = useCallback(async () => {
    const res = await testsHeatmap({ days: 84 });
    setData(res);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function onVis() { if (document.visibilityState === 'visible') load(); }
    window.addEventListener('visibilitychange', onVis);
    return () => window.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const grid = useMemo(() => {
    if (!data) return null;
    const map = new Map(data.counts.map(d => [d._id, d.count]));
    const start = new Date(data.start + 'T00:00:00');
    const cols = [];
    let max = 0;

    for (let i = 0; i < data.days; i++) {
      const dt = new Date(start); dt.setDate(start.getDate() + i);
      const key = dt.toISOString().slice(0, 10);
      const count = map.get(key) || 0;
      max = Math.max(max, count);
      const dow = dt.getDay(); // 0..6
      const w = Math.floor(i / 7);
      if (!cols[w]) cols[w] = new Array(7).fill(null);
      cols[w][dow] = { date: key, count };
    }
    return { cols, max };
  }, [data]);

  if (!data || !grid) {
    return <div className="max-w-6xl mx-auto p-6"><div className="card">Loading…</div></div>;
  }

  const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">Daily Tests Solved</div>
          <button className="btn" onClick={load}>Reload</button>
        </div>
        <div className="flex gap-2 overflow-x-auto py-2">
          <div className="flex flex-col justify-between py-1 pr-2 text-xs text-slate-400">
            {daysOfWeek.map(d => <div key={d} className="h-5">{d}</div>)}
          </div>
          <div className="flex gap-1">
            {grid.cols.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`h-5 w-5 rounded ${cell ? colorFor(cell.count, grid.max) : 'bg-slate-900/50'}`}
                    title={cell ? `${cell.date}: ${cell.count} test(s)` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Less</span>
          <div className="h-3 w-3 rounded bg-slate-800" />
          <div className="h-3 w-3 rounded bg-emerald-900" />
          <div className="h-3 w-3 rounded bg-emerald-700" />
          <div className="h-3 w-3 rounded bg-emerald-500" />
          <div className="h-3 w-3 rounded bg-emerald-300" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
