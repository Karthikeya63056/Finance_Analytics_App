import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter — Smooth count-up animation with locale formatting.
 * Props:
 *   value (number), duration (ms), prefix (string), suffix (string),
 *   decimals (number), className, formatOptions (Intl options)
 */
export function AnimatedCounter({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  formatOptions = null,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startRef = useRef(null);
  const prevRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = from + (to - from) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatOptions
    ? new Intl.NumberFormat('en-IN', formatOptions).format(displayValue)
    : displayValue.toFixed(decimals);

  return (
    <span className={`value-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
