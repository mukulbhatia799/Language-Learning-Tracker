import { useMemo } from 'react';

export default function DataTable({ data = [], columns = [], onEdit, onDelete, total = 0, page = 1, limit = 10, onPage }) {
  const rows = useMemo(() => data, [data]);
  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="table-head py-2">{c.label}</th>
              ))}
              {(onEdit || onDelete) && <th className="table-head py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-white/10">
                {columns.map((c) => (
                  <td key={c.key} className="py-3 pr-4 text-sm text-slate-200">{c.render ? c.render(r) : r[c.key]}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="py-3">
                    {onEdit && <button className="btn mr-2" onClick={() => onEdit(r)}>Edit</button>}
                    {onDelete && <button className="btn" onClick={() => onDelete(r)}>Delete</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
        <span>Page {page} • Total {total}</span>
        <div className="flex gap-2">
          <button className="btn" disabled={page <= 1} onClick={() => onPage?.(page - 1)}>Prev</button>
          <button className="btn" disabled={page * limit >= total} onClick={() => onPage?.(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}