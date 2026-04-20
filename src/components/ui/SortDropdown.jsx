import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";

export const SortDropdown = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="surface-soft inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-emerald-300/30"
      >
        Sort: {value}
        <FiChevronDown
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="surface-card absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-3xl">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm transition ${
                  value === option.label
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
