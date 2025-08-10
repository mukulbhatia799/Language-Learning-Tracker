import { useEffect, useState } from 'react';
import * as api from '../services/vocab';
import DataTable from '../components/DataTable';

export default function Vocab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', language: '', learned: '', pos: '' });
  const [form, setForm] = useState({ language: '', term: '', translation: '', partOfSpeech: 'noun', example: '', learned: false });
  const limit = 10;

  async function load(p = page) {
    const { data, total } = await api.listVocab({ ...filters, page: p, limit });
    setItems(data);
    setTotal(total);
    setPage(p);
  }
  useEffect(() => { load(1); }, [filters]);

  async function create(e) {
    e.preventDefault();
    await api.createVocab(form);
    setForm({ language: '', term: '', translation: '', partOfSpeech: 'noun', example: '', learned: false });
    load();
  }
  async function onEdit(row) {
    const learned = confirm('Mark as learned?');
    await api.updateVocab(row._id, { ...row, learned });
    load();
  }
  async function onDelete(row) {
    if (confirm('Delete?')) {
      await api.deleteVocab(row._id);
      load();
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <form onSubmit={create} className="card grid md:grid-cols-6 gap-4">
        <input className="input" placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} required />
        <input className="input" placeholder="Term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} required />
        <input className="input" placeholder="Translation" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} required />
        <select className="input" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })}>
          <option>noun</option>
          <option>verb</option>
          <option>adj</option>
          <option>adv</option>
          <option>phrase</option>
          <option>other</option>
        </select>
        <input className="input" placeholder="Example" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
        <button className="btn btn-primary" type="submit">Add Vocab</button>
      </form>

      <div className="card grid md:grid-cols-5 gap-4">
        <input className="input" placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <input className="input" placeholder="Language" value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })} />
        <select className="input" value={filters.pos} onChange={(e) => setFilters({ ...filters, pos: e.target.value })}>
          <option value="">Any POS</option>
          <option>noun</option>
          <option>verb</option>
          <option>adj</option>
          <option>adv</option>
          <option>phrase</option>
          <option>other</option>
        </select>
        <select className="input" value={filters.learned} onChange={(e) => setFilters({ ...filters, learned: e.target.value })}>
          <option value="">Any status</option>
          <option value="true">Learned</option>
          <option value="false">Not learned</option>
        </select>
        <button className="btn" onClick={() => setFilters({ q: '', language: '', learned: '', pos: '' })}>Reset</button>
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
          { key: 'language', label: 'Lang' },
          { key: 'term', label: 'Term' },
          { key: 'translation', label: 'Translation' },
          { key: 'partOfSpeech', label: 'POS' },
          { key: 'learned', label: 'Learned', render: (r) => r.learned ? '✅' : '—' },
        ]}
      />
    </div>
  );
}