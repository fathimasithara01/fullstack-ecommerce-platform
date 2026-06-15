import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../../types';

export const ProductGrid: React.FC<{ products: Product[]; isLoading: boolean }> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse space-y-4">
            <div className="aspect-square w-full rounded-md bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-60 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">No active products match selection grids.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};