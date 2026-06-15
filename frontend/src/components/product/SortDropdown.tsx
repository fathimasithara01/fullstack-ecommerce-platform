import React from 'react';

export const SortDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none"
    >
      <option value="">Default Ranking</option>
      <option value="price_asc">Price: Ascending</option>
      <option value="price_desc">Price: Descending</option>
    </select>
  );
};