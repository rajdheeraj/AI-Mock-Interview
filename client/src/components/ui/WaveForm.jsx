export function WaveForm({ active = false }) {
  if (!active) return (
    <div className="flex items-center gap-0.5 h-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-0.5 h-1.5 bg-white/20 rounded-full" />
      ))}
    </div>
  );
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[3,5,7,5,3].map((h, i) => (
        <div
          key={i}
          className="w-0.5 bg-indigo-400 rounded-full wave-bar"
          style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}