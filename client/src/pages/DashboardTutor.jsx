import { useEffect, useState } from 'react';
import * as testApi from '../services/tests';

export default function DashboardTutor() {
  const [tests, setTests] = useState([]);
  useEffect(() => { (async () => setTests(await testApi.mine()))(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="card">
        <div className="text-lg font-semibold mb-3">My Tests</div>
        {tests.length === 0 && <div className="text-sm text-slate-300">No tests yet. Create one!</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {tests.map(t => (
            <a key={t._id} href={`/tests/manage/${t._id}`} className="card hover:shadow-glow">
              <div className="font-semibold">{t.title}</div>
              <div className="text-xs text-slate-300">{t.language} • {Math.round(t.durationSec/60)} min</div>
              <div className="text-sm mt-2">Completed: <b>{t.submissionsCount}</b></div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
