import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiFilter, FiSliders } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTransactions } from "../hooks/useTransactions";
import { useDebounce } from "../hooks/useDebounce";
import { TransactionCard } from "../components/ui/TransactionCard";
import { SearchBar } from "../components/ui/SearchBar";
import { FilterDrawer } from "../components/ui/FilterDrawer";
import { SortDropdown } from "../components/ui/SortDropdown";

export const Transactions = () => {
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useTransactions();
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortValue, setSortValue] = useState("newest");
  const [filters, setFilters] = useState({
    categories: [],
    type: "all",
    dateFrom: "",
    dateTo: "",
  });

  const debouncedSearch = useDebounce(searchInput, 300);

  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (debouncedSearch) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.notes.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }

    if (filters.type !== "all") {
      result = result.filter((t) => t.type === filters.type);
    }

    if (filters.categories.length > 0) {
      result = result.filter((t) => filters.categories.includes(t.category));
    }

    if (filters.dateFrom) {
      result = result.filter((t) => t.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter((t) => t.date <= filters.dateTo);
    }

    switch (sortValue) {
      case "oldest":
        result = [...result].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );
        break;
      case "high-to-low":
        result = [...result].sort((a, b) => b.amount - a.amount);
        break;
      case "low-to-high":
        result = [...result].sort((a, b) => a.amount - b.amount);
        break;
      case "a-z":
        result = [...result].sort((a, b) =>
          a.category.localeCompare(b.category),
        );
        break;
      default:
        result = [...result].sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
    }

    return result;
  }, [transactions, debouncedSearch, filters, sortValue]);

  const handleDelete = (id) => {
    if (window.confirm("Remove transaction permanently?")) {
      deleteTransaction(id);
      toast.success("Transaction removed.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/transactions/new?id=${id}`);
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "high-to-low", label: "High to Low" },
    { value: "low-to-high", label: "Low to High" },
    { value: "a-z", label: "A-Z" },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
            Transactions
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-100">
            Activity stream
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-400">
            Filter, sort, and edit every transaction with a fast and elegant
            workflow.
          </p>
        </div>
        <button
          onClick={() => navigate("/transactions/new")}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition active:scale-95"
        >
          <FiPlus size={18} /> Add transaction
        </button>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-4">
          <div className="surface-card rounded-[32px] p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search title, note, category..."
              />
              <div className="flex gap-3">
                <SortDropdown
                  value={sortOptions.find((o) => o.value === sortValue)?.label || "Newest"}
                  onChange={setSortValue}
                  options={sortOptions}
                />
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="surface-soft inline-flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-emerald-300/30 hover:text-emerald-200"
                >
                  <FiFilter size={18} /> Filters
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="surface-soft rounded-full px-3 py-2">
                {filteredTransactions.length} results
              </span>
              <span className="surface-soft rounded-full px-3 py-2">
                Sort: {sortOptions.find((o) => o.value === sortValue)?.label}
              </span>
              <span className="surface-soft rounded-full px-3 py-2">
                Type: {filters.type}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="surface-card rounded-[32px] p-10 text-center text-gray-400">
                <p className="text-xl font-semibold text-gray-100">
                  No matching transactions
                </p>
                <p className="mt-2 text-sm">
                  Adjust your filters or add a transaction to populate the list.
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="surface-card rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
                  Smart actions
                </p>
                <h2 className="mt-2 text-xl font-semibold text-gray-100">
                  Quick refine
                </h2>
              </div>
              <FiSliders className="text-emerald-300" size={20} />
            </div>
            <div className="mt-5 space-y-3 text-sm text-gray-400">
              <p>
                Toggle filters to see only incomes, expenses, or categories in
                one tap.
              </p>
              <p>Search by note, vendor, or title for instant results.</p>
              <p>Sort by date, amount, or category for cleaner review.</p>
            </div>
          </div>

          <div className="surface-card rounded-[32px] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
              Need help?
            </p>
            <div className="mt-4 space-y-3 text-sm text-gray-400">
              <p>
                Use the filter drawer for date ranges and category selection.
              </p>
              <p>Each card has inline edit and delete controls.</p>
              <p>
                Keep the list focused by clearing the search field between
                reviews.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilter={setFilters}
      />
    </div>
  );
};
