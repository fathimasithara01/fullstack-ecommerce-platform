'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { FilterSidebar } from '../../components/product/FilterSidebar';
import { SortDropdown } from '../../components/product/SortDropdown';
import { ProductGrid } from '../../components/product/ProductGrid';

export default function ProductsListingPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: catData } = useCategories();
  const { data: prodData, isLoading } = useProducts({
    search: debouncedSearch,
    category,
    maxPrice: priceRange[1],
    sortBy,
    page,
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 py-4">
      <FilterSidebar
        categories={catData || []}
        selectedCategory={category}
        onSelectCategory={(slug) => { setCategory(slug); setPage(1); }}
        priceRange={priceRange}
        onChangePrice={(range) => { setPriceRange(range); setPage(1); }}
      />
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <input
            type="text"
            placeholder="Search our catalog index..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs rounded-md border border-slate-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); setPage(1); }} />
        </div>
        <ProductGrid products={prodData?.data || []} isLoading={isLoading} />
      </div>
    </div>
  );
}