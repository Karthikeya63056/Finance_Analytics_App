import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiZap, FiLock, FiStar } from 'react-icons/fi';
import { useGamification } from '../../context/GamificationContext';
import { GlassCard } from '../../components/v2/ui/GlassCard';
import { ProgressRing } from '../../components/v2/ui/ProgressRing';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Achievements() {
  const { xp, level, badges, unlockedBadges, streak, goals, isBadgeUnlocked, levels } = useGamification();
  const unlockedCount = unlockedBadges.length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="v2-label">Gamification</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-100">Achievements</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-400">Track your financial journey, earn badges, and level up your money skills.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        {/* Left: Level + Stats */}
        <div className="space-y-6">
          <GlassCard glow className="flex flex-col items-center py-8">
            <ProgressRing value={level.progressToNext} size={140} strokeWidth={10}>
              <span className="text-3xl font-bold text-gray-100">{level.level}</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-gray-400">Level</span>
            </ProgressRing>
            <p className="mt-4 text-xl font-bold text-emerald-300">{level.name}</p>
            <p className="mt-1 text-xs text-gray-500">{xp} XP · Next: {level.nextLevel?.name} ({level.nextLevel?.minXP} XP)</p>
            <div className="mt-6 w-full px-6">
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level.progressToNext}%` }}
                  transition={{ duration: 1.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Badges', value: unlockedCount, total: badges.length, icon: '🏅' },
              { label: 'Streak', value: streak, total: null, icon: '🔥' },
              { label: 'Goals', value: goals.length, total: null, icon: '🎯' },
            ].map((stat) => (
              <GlassCard key={stat.label} hover={false} className="!p-4 text-center">
                <span className="text-2xl">{stat.icon}</span>
                <p className="mt-2 text-xl font-bold text-gray-100">
                  {stat.value}{stat.total !== null ? <span className="text-sm text-gray-500">/{stat.total}</span> : null}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Level Roadmap */}
          <GlassCard>
            <p className="v2-label">Level roadmap</p>
            <div className="mt-4 space-y-2">
              {levels.map((l) => {
                const reached = xp >= l.minXP;
                const current = level.level === l.level;
                return (
                  <div key={l.level}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${
                      current ? 'border border-emerald-500/30 bg-emerald-500/10' :
                      reached ? 'opacity-70' : 'opacity-30'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      reached ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-gray-500'
                    }`}>
                      {l.level}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200">{l.name}</p>
                      <p className="text-[10px] text-gray-500">{l.minXP} XP required</p>
                    </div>
                    {current && <FiStar size={14} className="text-emerald-400" />}
                    {reached && !current && <span className="text-[10px] text-emerald-500">✓</span>}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Right: Badge Grid */}
        <div>
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiAward size={16} className="text-amber-400" />
                <p className="v2-label" style={{ margin: 0 }}>All badges</p>
              </div>
              <span className="v2-badge-accent">{unlockedCount}/{badges.length}</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {badges.map((badge, i) => {
                const unlocked = isBadgeUnlocked(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                      unlocked
                        ? 'border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    {!unlocked && (
                      <div className="absolute right-2 top-2">
                        <FiLock size={12} className="text-gray-600" />
                      </div>
                    )}
                    <span className={`text-3xl ${unlocked ? '' : 'grayscale opacity-30'}`}>
                      {badge.icon}
                    </span>
                    <p className={`mt-3 text-sm font-semibold ${unlocked ? 'text-gray-100' : 'text-gray-500'}`}>
                      {badge.name}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">{badge.desc}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <FiZap size={10} className={unlocked ? 'text-amber-400' : 'text-gray-600'} />
                      <span className={`text-[10px] font-semibold ${unlocked ? 'text-amber-400' : 'text-gray-600'}`}>
                        {badge.xp} XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
