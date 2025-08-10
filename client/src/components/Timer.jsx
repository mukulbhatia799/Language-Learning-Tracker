import { useEffect, useState } from 'react';

export default function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);
  const m = Math.floor(left / 60).toString().padStart(2,'0');
  const s = (left % 60).toString().padStart(2,'0');
  return <span className="px-2 py-1 rounded bg-white/10">{m}:{s}</span>;
}
