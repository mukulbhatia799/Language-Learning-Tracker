import { useEffect, useState } from 'react';
import * as api from '../services/lessons';
import DataTable from '../components/DataTable';

export default function Lessons() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', language: '', difficulty: '', completed: '' });
  const [form, setForm] = useState({ language: '', title: '', difficulty: 'Beginner', completedAt: '', notes: '' });
  const limit = 10;

  async function load(p = page) {
    const { data, total } = await api.listLessons({ ...filters, page: p, limit });
    setItems(data);
    setTotal(total);
    setPage(p);
  }

  useEffect(() => { load(1); }, [filters]);

  async function create(e) {
    e.preventDefault();
    const payload = { ...form, completedAt: form.completedAt || null };
    await api.createLesson(payload);
    setForm({ language: '', title: '', difficulty: 'Beginner', completedAt: '', notes: '' });
    load();
  }

  async function onEdit(row) {
    const title = prompt('New title', row.title);
    if (!title) return;
    await api.updateLesson(row._id, { ...row, title });
    load();
  }

  async function onDelete(row) {
    if (confirm('Delete?')) {
      await api.deleteLesson(row._id);
      load();
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={create} className="card grid md:grid-cols-5 gap-4">
        <input className="input" placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} required />
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <input className="input" type="date" value={form.completedAt} onChange={(e) => setForm({ ...form, completedAt: e.target.value })} />
        <button className="btn btn-primary" type="submit">Add Lesson</button>
      </form>

      <div className="card grid md:grid-cols-5 gap-4">
        <input className="input" placeholder="Search title" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <input className="input" placeholder="Language" value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })} />
        <select className="input" value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">Any difficulty</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select className="input" value={filters.completed} onChange={(e) => setFilters({ ...filters, completed: e.target.value })}>
          <option value="">Any status</option>
          <option value="true">Completed</option>
          <option value="false">Not completed</option>
        </select>
        <button className="btn" onClick={() => setFilters({ q: '', language: '', difficulty: '', completed: '' })}>Reset</button>
      </div>

      <DataTable
        data={items}
        total={total}
        page={page}
        limit={limit}
        onPage={load}
        onEdit={onEdit}
        onDelete={onDelete}
        columns={[
          { key: 'language', label: 'Language' },
          { key: 'title', label: 'Title' },
          { key: 'difficulty', label: 'Level' },
          { key: 'completedAt', label: 'Completed', render: (r) => r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—' },
        ]}
      />
    </div>
  );
}