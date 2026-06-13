import { motion } from 'framer-motion';

export function ScoreRing({ score, size = 160, strokeWidth = 12, animate = true }) {
  const r   = (size - strokeWidth) / 2;
  const c   = 2 * Math.PI * r;
  const off = c - (score / 100) * c;

  const color =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#6366f1' :
    score >= 40 ? '#f59e0b' : '#ef4444';

  const label =
    score >= 80 ? 'Excellent' :
    score >= 60 ? 'Good' :
    score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ overflow:'visible' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Glow */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth + 4} opacity="0.1"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
        {/* Progress */}
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={c}
          initial={animate ? { strokeDashoffset: c } : { strokeDashoffset: off }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-black leading-none"
          style={{ fontSize: size * 0.2, color }}
          initial={animate ? { opacity:0, scale:0.5 } : { opacity:1, scale:1 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ delay:0.8, duration:0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-white/30 font-medium mt-1" style={{ fontSize: size * 0.085 }}>
          {label}
        </span>
      </div>
    </div>
  );
}