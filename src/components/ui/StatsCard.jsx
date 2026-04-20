import React from "react";

export const StatsCard = ({ title, value, detail, accent = "emerald" }) => {
  const accentClasses = {
    emerald: "text-emerald-200 bg-emerald-500/20 border border-emerald-300/30",
    rose: "text-rose-200 bg-rose-500/20 border border-rose-300/30",
    indigo: "text-indigo-200 bg-indigo-500/20 border border-indigo-300/30",
    slate: "text-gray-200 bg-slate-500/20 border border-slate-300/30",
  };

  return (
    <div className="surface-card rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400">
            {title}
          </p>
          <p className="value-mono mt-4 text-3xl font-semibold text-gray-100">{value}</p>
        </div>
        <div
          className={`rounded-3xl px-3 py-2 text-sm font-semibold ${accentClasses[accent] || accentClasses.slate}`}
        >
          {detail}
        </div>
      </div>
    </div>
  );
};
