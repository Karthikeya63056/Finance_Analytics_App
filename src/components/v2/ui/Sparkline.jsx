import React, { useMemo } from 'react';

/**
 * Sparkline — Tiny inline SVG chart for showing trends.
 * Props:
 *   data (number[]), width (px), height (px), color, strokeWidth,
 *   filled (bool), className, animate (bool)
 */
export function Sparkline({
  data = [],
  width = 100,
  height = 32,
  color = 'var(--v2-accent-primary, #10b981)',
  strokeWidth = 2,
  filled = true,
  className = '',
}) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * w,
      y: padding + h - ((v - min) / range) * h,
    }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (!filled || !path) return '';
    return `${path} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`;
  }, [path, filled, width, height]);

  const gradientId = `spark-${React.useId().replace(/:/g, '')}`;

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && fillPath && (
        <path d={fillPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
