import { useEffect, useState } from 'react';

export default function Toast({ message, onClose }) {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 3000); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!show) onClose?.(); }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 card shadow-glow text-sm">
      {message}
    </div>
  );
}