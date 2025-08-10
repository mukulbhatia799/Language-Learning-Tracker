import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const blobs = [
    { id: 1, className: 'w-72 h-72 bg-brand/30 left-[10%] top-[15%]' },
    { id: 2, className: 'w-96 h-96 bg-fuchsia-500/20 left-[60%] top-[40%]' },
    { id: 3, className: 'w-64 h-64 bg-cyan-400/20 left-[30%] top-[70%]' }
  ];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={b.id}
          className={`absolute rounded-full blur-3xl ${b.className}`}
          animate={{ y: [0, -20, 0], x: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(60px)' }}
        />
      ))}
      <motion.div className="absolute top-0 left-0 h-1 w-1 bg-white/0"
        animate={{ x: ['-10%', '110%'] }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}