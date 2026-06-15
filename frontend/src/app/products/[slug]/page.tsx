'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProductBySlug } from '../../../hooks/useProducts';
import { ImageGallery } from '../../../components/product/ImageGallery';
import { ReviewSection } from '../../../components/product/ReviewSection';
import { ProductGrid } from '../../../components/product/ProductGrid';

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { data, isLoading, isError } = useProductBySlug(slug);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20 font-medium text-slate-500">
        Fatal Exception. Product variant matching this slug identifier path could not be resolved.
      </div>
    );
  }

  const { product, related } = data;

  return (
    <div className="space-y-12 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <ImageGallery images={product.images} />
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.category?.name}</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">{product.name}</h1>
            <p className="text-2xl font-bold text-slate-900 mt-4">${Number(product.price).toFixed(2)}</p>
            <p className="text-base text-slate-600 mt-4 leading-relaxed">{product.description}</p>
          </div>
          
          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-slate-700">Quantity Context</label>
              <div className="flex items-center rounded-md border border-slate-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-50 transition"
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-50 transition"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400 font-medium">({product.stock} instances deployable in stock)</span>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 rounded-md bg-indigo-600 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition focus:outline-none focus:ring-2 focus:ring-indigo-600">
                Inject into Cart Channel
              </button>
              <button className="rounded-md border border-slate-300 px-4 py-3 text-slate-700 hover:bg-slate-50 transition">
                ♥
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection reviews={product.reviews || []} />

      <div className="border-t border-slate-200 pt-10">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Related System Recommendations</h3>
        <ProductGrid products={related} isLoading={false} />
      </div>
    </div>
  );
}