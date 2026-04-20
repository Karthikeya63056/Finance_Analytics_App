import React from "react";
import { Controller, useForm } from "react-hook-form";
import { FiCheckCircle } from "react-icons/fi";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CATEGORIES } from "../../utils/categories";

const validationSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Keep it short and clear"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Use a positive value"),
  category: yup.string().required("Select a category"),
  type: yup.string().required("Select a type"),
  date: yup.string().required("Pick a date"),
  notes: yup.string(),
});

export const TransactionForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const type = watch("type");
  const amount = watch("amount");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-gray-200">Title</label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="e.g. Salary payment"
                className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
              />
            )}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-rose-500">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-200">Amount</label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                placeholder="0.00"
                step="0.01"
                className="input-dark value-mono mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
              />
            )}
          />
          {errors.amount && (
            <p className="mt-2 text-sm text-rose-500">
              {errors.amount.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-gray-200">Type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="mt-2 flex gap-3">
                {[
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`inline-flex flex-1 items-center justify-center rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
                      field.value === option.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-white/15 bg-white/5 text-gray-300 hover:border-emerald-300/25"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />
          {errors.type && (
            <p className="mt-2 text-sm text-rose-500">{errors.type.message}</p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-gray-200">Date</label>
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
            <p className="mt-2 text-sm text-rose-500">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-200">Notes</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                placeholder="Optional note"
                className="input-dark mt-2 w-full rounded-3xl px-4 py-3 outline-none transition"
              />
            )}
          />
          {errors.notes && (
            <p className="mt-2 text-sm text-rose-500">{errors.notes.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="surface-soft rounded-3xl px-5 py-4 text-sm text-gray-300">
          {amount
            ? `Preview: ${amount} ${type === "income" ? "income" : "expense"}`
            : "Enter amount and type to preview."}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-3xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiCheckCircle />
          {isSubmitting ? "Saving..." : "Save transaction"}
        </button>
      </div>
    </form>
  );
};
