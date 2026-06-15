'use client';

import React from 'react';
import { Category } from '../../types';

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  priceRange: [number, number];
  onChangePrice: (range: [number, number]) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onChangePrice,
}) => {
  return (
    <div className="space-y-6 hidden md:block w-64 flex-shrink-0">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories Tree</h4>
        <div className="mt-3 space-y-2">
          <button
            onClick={() => onSelectCategory('')}
            className={`block text-sm font-medium ${!selectedCategory ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            All Classifications
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`block text-sm font-medium ${selectedCategory === cat.slug ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <hr className="border-slate-200" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget Constraint Max ($USD)</h4>
        <input
          type="range"
          min="0"
          max="5000"
          value={priceRange[1]}
          onChange={(e) => onChangePrice([priceRange[0], parseInt(e.target.value)])}
          className="w-full accent-indigo-600 mt-4"
        />
        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
          <span>$0</span>
          <span>Max: ${priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};