import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard — Premium glassmorphic card with hover glow and entry animation.
 * Props:
 *   children, className, hover (bool), glow (bool), delay (number), onClick
 */
export function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  delay = 0,
  onClick,
  ...rest
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -3, transition: { duration: 0.25 } } : undefined}
      onClick={onClick}
      className={`v2-card p-6 ${glow ? 'v2-animate-glow-pulse' : ''} ${className}`}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
