import { useEffect, useState } from 'react';
import * as notif from '../services/notifications';
import { getSocket } from '../socket';

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function load() {
    try {
      const list = await notif.list();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      // swallow UI errors for the bell
      setItems([]);
    }
  }

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    load();
    const s = getSocket();
    if (!s) return;
    const onNew = (n) => setItems(prev => [n, ...prev]);
    s.on('notification:new', onNew);
    return () => s.off('notification:new', onNew);
  }, []);

  const unread = items.filter(i => !i.readAt).length;

  async function markOne(id) {
    try {
      await notif.markRead(id);
      await load();
    } catch {}
  }

  async function clearAll() {
    if (!items.length) return;
    setClearing(true);
    try {
      await notif.clearAll();
      setItems([]);
    } catch {
      // ignore visual errors here
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="relative">
      <button className="btn" onClick={() => setOpen(v => !v)}>
        🔔 {unread > 0 && (
          <span className="ml-1 text-xs bg-red-500 px-2 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 card max-h-96 overflow-auto z-50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="text-sm font-semibold">Notifications</div>
            <button
              className="text-xs underline text-red-400 disabled:opacity-50"
              onClick={clearAll}
              disabled={clearing || items.length === 0}
              title="Clear all notifications"
            >
              {clearing ? 'Clearing…' : 'Clear All'}
            </button>
          </div>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-300">
              No notifications
            </div>
          )}

          {/* List */}
          <div className="divide-y divide-white/10">
            {items.map(n => (
              <div key={n._id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* Title/message block */}
                    <div className="text-sm text-slate-100 break-words">
                      {n.title || n.message || 'Notification'}
                    </div>
                    {(n.body || n.description || n.message) && (
                      <div className="mt-1 text-xs text-slate-400 break-words">
                        {n.body || n.description || n.message}
                      </div>
                    )}
                    {n.createdAt && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {!n.readAt && (
                    <button
                      className="flex-shrink-0 text-xs underline text-brand"
                      onClick={() => markOne(n._id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
