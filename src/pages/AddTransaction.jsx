import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useTransactions } from "../hooks/useTransactions";
import { useCurrency } from "../hooks/useCurrency";
import { CATEGORIES } from "../utils/categories";

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Use a short descriptive title"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: yup.string().required("Category is required"),
  type: yup.string().required("Type is required"),
  date: yup
    .string()
    .required("Date is required")
    .test("not-future", "Date cannot be in the future", (value) => {
      if (!value) return false;
      return new Date(value) <= new Date();
    }),
  notes: yup.string(),
});

export const AddTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, addTransaction, updateTransaction } = useTransactions();
  const { formatCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editId = searchParams.get("id");
  const existingTransaction = transactions.find((t) => t.id === editId);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: existingTransaction
      ? {
          title: existingTransaction.title,
          amount: existingTransaction.amount,
          category: existingTransaction.category,
          type: existingTransaction.type,
          date: existingTransaction.date,
          notes: existingTransaction.notes,
          recurring: existingTransaction.recurring,
        }
      : {
          title: "",
          amount: "",
          category: "Food & Dining",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          recurring: false,
        },
  });

  useEffect(() => {
    if (existingTransaction) {
      reset({
        title: existingTransaction.title,
        amount: existingTransaction.amount,
        category: existingTransaction.category,
        type: existingTransaction.type,
        date: existingTransaction.date,
        notes: existingTransaction.notes,
        recurring: existingTransaction.recurring,
      });
    }
  }, [existingTransaction, reset]);

  const type = watch("type");
  const amount = watch("amount");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, amount: parseFloat(data.amount) };
      if (existingTransaction) {
        updateTransaction(editId, payload);
        toast.success("Transaction updated successfully!");
      } else {
        addTransaction({ ...payload, id: uuidv4() });
        toast.success("Transaction added successfully!");
      }
      navigate("/transactions");
    } catch {
      toast.error("Unable to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 xl:py-10">
      <button
        onClick={() => navigate("/transactions")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-gray-200"
      >
        <FiArrowLeft size={18} /> Back to transactions
      </button>

      <div className="surface-card mt-6 rounded-[32px] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-gray-400">
              {existingTransaction ? "Edit transaction" : "Add transaction"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-100">
              {existingTransaction ? "Update details" : "Quick expense input"}
            </h1>
          </div>
          <div className="surface-soft rounded-3xl px-4 py-3 text-sm text-gray-300">
            Smart defaults and category suggestions keep this fast.
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-200">
                Title
              </label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g. Freelance design"
                    className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
                  />
                )}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-200">
                Amount
              </label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition value-mono"
                  />
                )}
              />
              {errors.amount && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.amount.message}
                </p>
              )}
              {amount && !errors.amount && (
                <p className="mt-2 text-sm text-gray-400">
                  Preview: {formatCurrency(parseFloat(amount) || 0)}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-200">
                Type
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {["income", "expense"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => field.onChange(option)}
                        className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                          field.value === option
                            ? option === "income"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-white/15 bg-white/5 text-gray-300 hover:border-emerald-300/25"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.type && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-200">
                Category
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
                  >
                    {CATEGORIES.filter((cat) =>
                      type === "income" ? cat === "Salary" : cat !== "Salary",
                    ).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.category && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-200">
                Date
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
                  />
                )}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-rose-500">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-200">
                Notes
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Optional details"
                    className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
                  />
                )}
              />
            </div>
          </div>

          <div className="surface-soft flex items-center justify-between gap-4 rounded-[28px] p-5 text-sm text-gray-400">
            <div>
              <p className="font-semibold text-gray-100">Fast entry</p>
              <p className="mt-1">
                Minimal fields keep add transaction flow under three clicks.
              </p>
            </div>
            <div className="surface-card rounded-3xl px-4 py-3 text-gray-200">
              {existingTransaction ? "Editing" : "New"}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-3xl px-6 py-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheckCircle size={18} />
            {isSubmitting
              ? "Saving..."
              : existingTransaction
                ? "Update transaction"
                : "Add transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};
