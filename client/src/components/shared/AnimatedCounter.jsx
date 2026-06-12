import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({
  to = 0,
  duration = 1500,
  suffix = ''
}) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(ease * to));

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      if (raf.current) {
        cancelAnimationFrame(raf.current);
      }
    };
  }, [to, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

export default AnimatedCounter;