import { useEffect, useState } from 'react';
import * as notes from '../services/notes';
import toast from 'react-hot-toast';

export default function Notes() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filters, setFilters] = useState({ q: '', source: 'English', target: 'Hindi' });
  const [form, setForm] = useState({ source: 'English', target: 'Hindi', from: '', to: '', example: '' });

  async function load(p = page) {
    const res = await notes.list({ ...filters, page: p, limit });
    setItems(res.data); setTotal(res.total); setPage(res.page);
  }
  useEffect(() => { load(1); }, [filters]);

  async function add(e) {
    e.preventDefault();
    try {
      await notes.create(form);
      toast.success('Note added');
      setForm({ ...form, from: '', to: '', example: '' });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to add');
    }
  }

  async function del(id) {
    await notes.remove(id);
    toast.success('Deleted');
    load();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={add} className="card grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="Source lang" value={form.source} onChange={e=>setForm({...form, source:e.target.value})} />
        <input className="input" placeholder="Target lang" value={form.target} onChange={e=>setForm({...form, target:e.target.value})} />
        <input className="input" placeholder="Word/Phrase (source)" value={form.from} onChange={e=>setForm({...form, from:e.target.value})} required />
        <input className="input" placeholder="Translation (target)" value={form.to} onChange={e=>setForm({...form, to:e.target.value})} required />
        <button className="btn btn-primary">Add</button>
        <input className="input md:col-span-5" placeholder="Example sentence (optional)" value={form.example} onChange={e=>setForm({...form, example:e.target.value})} />
      </form>

      <div className="card grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="Search" value={filters.q} onChange={e=>setFilters({...filters, q:e.target.value})} />
        <input className="input" placeholder="Source lang" value={filters.source} onChange={e=>setFilters({...filters, source:e.target.value})} />
        <input className="input" placeholder="Target lang" value={filters.target} onChange={e=>setFilters({...filters, target:e.target.value})} />
        <div className="md:col-span-2 flex items-center">
          <div className="text-xs text-slate-400">Total: {total}</div>
          <div className="ml-auto flex gap-2">
            <button className="btn" onClick={()=>setFilters({ q:'', source:'English', target:'Hindi' })}>Reset</button>
            <button className="btn" onClick={()=>load(page + 1)}>Next</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map(n => (
          <div key={n._id} className="card">
            <div className="font-semibold">{n.from} → {n.to}</div>
            <div className="text-xs text-slate-400">{n.source} → {n.target}</div>
            {n.example && <div className="text-sm mt-2">{n.example}</div>}
            <button className="btn mt-2" onClick={()=>del(n._id)}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <div className="card text-sm text-slate-300">No notes yet.</div>}
      </div>
    </div>
  );
}
