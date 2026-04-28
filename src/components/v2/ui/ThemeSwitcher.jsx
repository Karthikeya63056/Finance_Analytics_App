import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

const MODE_ICONS = { dark: FiMoon, light: FiSun, system: FiMonitor };
const MODE_LABELS = { dark: 'Dark', light: 'Light', system: 'System' };

/**
 * ThemeSwitcher — Compact mode toggle + accent color picker.
 * Props: showAccents (bool), className
 */
export function ThemeSwitcher({ showAccents = false, className = '' }) {
  const { mode, accent, accents, toggleMode, setAccent } = useTheme();
  const ModeIcon = MODE_ICONS[mode] || FiMoon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={toggleMode}
        className="v2-btn-ghost flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold"
        title={`Theme: ${MODE_LABELS[mode]}`}
        aria-label={`Switch theme, currently ${MODE_LABELS[mode]}`}
      >
        <ModeIcon size={15} />
        <span className="hidden sm:inline">{MODE_LABELS[mode]}</span>
      </button>

      {showAccents && (
        <div className="flex gap-1.5">
          {accents.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className="h-5 w-5 rounded-full border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: a === 'emerald' ? '#10b981'
                  : a === 'cyan' ? '#22d3ee'
                  : a === 'violet' ? '#8b5cf6'
                  : a === 'rose' ? '#f43f5e'
                  : a === 'amber' ? '#f59e0b'
                  : '#3b82f6',
                borderColor: accent === a ? '#fff' : 'transparent',
                boxShadow: accent === a ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
              }}
              title={a}
              aria-label={`Set accent color to ${a}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
