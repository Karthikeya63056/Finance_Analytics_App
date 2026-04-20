import React from "react";
import { FiSearch } from "react-icons/fi";

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search transactions...",
}) => {
  return (
    <div className="relative">
      <FiSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        size={20}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-dark w-full rounded-3xl py-3 pl-12 pr-4 outline-none transition"
      />
    </div>
  );
};
