import React, { useEffect, useRef, useState } from 'react';

interface StatsCounterProps {
  target: number;
  suffix?: string;
  label: string;
  icon: React.ReactNode;
  duration?: number;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  target,
  suffix = '',
  label,
  icon,
  duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function animate() {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-brand-600">{icon}</span>
        <span className="text-3xl font-bold text-white">
          {count.toLocaleString()}
          {suffix}
        </span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
};

export default StatsCounter;
