import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FiFilter, FiX } from "react-icons/fi";

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Travel",
  "Salary",
];

export const FilterDrawer = ({ onFilter, onClose, isOpen }) => {
  const [filters, setFilters] = useState({
    categories: [],
    type: "all",
    dateFrom: "",
    dateTo: "",
  });

  const handleCategoryToggle = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleApply = () => {
    onFilter(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      categories: [],
      type: "all",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            onClick={onClose}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="glass fixed bottom-0 left-0 right-0 z-40 rounded-t-[32px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-100">
                <FiFilter /> Filters
              </h2>
              <button
                onClick={onClose}
                className="surface-soft rounded-2xl p-2 text-gray-300 transition hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-gray-200">Type</h3>
                <div className="flex gap-2">
                  {["all", "income", "expense"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters((prev) => ({ ...prev, type }))}
                      className={
                        "rounded-3xl px-4 py-3 text-sm font-semibold transition " +
                        (filters.type === type
                          ? "bg-emerald-600/85 text-white"
                          : "surface-soft text-gray-300 hover:bg-white/8")
                      }
                    >
                      {type === "all"
                        ? "All"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-200">
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={
                        "rounded-3xl px-3 py-2 text-sm font-semibold transition " +
                        (filters.categories.includes(category)
                          ? "bg-emerald-600/85 text-white"
                          : "surface-soft text-gray-300 hover:bg-white/8")
                      }
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-200">
                  Date range
                </h3>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                      }))
                    }
                    className="input-dark w-full rounded-3xl px-4 py-3 outline-none transition"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                      }))
                    }
                    className="input-dark w-full rounded-3xl px-4 py-3 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="surface-soft flex-1 rounded-3xl px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-white/25"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="btn-primary flex-1 rounded-3xl px-4 py-3 text-sm font-semibold transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
