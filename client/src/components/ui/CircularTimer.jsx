import { motion } from 'framer-motion';

export function CircularTimer({ timeLeft, total, size = 80 }) {
  const r   = (size - 8) / 2;
  const c   = 2 * Math.PI * r;
  const off = c - (timeLeft / total) * c;
  const pct = timeLeft / total;

  const color =
    pct > 0.5 ? '#22c55e' :
    pct > 0.25 ? '#f59e0b' : '#ef4444';

  const isLow = pct <= 0.25;

  return (
    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ filter: isLow ? `drop-shadow(0 0 6px ${color})` : 'none' }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold tabular-nums leading-none"
          style={{ fontSize: size * 0.2, color }}
        >
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2,'0')}
        </span>
      </div>
    </div>
  );
}