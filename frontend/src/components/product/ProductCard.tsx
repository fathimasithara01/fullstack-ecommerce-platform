'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100 group-hover:opacity-75 relative">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-w-7xl) 25vw"
          className="object-cover object-center"
          priority={false}
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            <Link href={`/products/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-slate-400">{product.tags.join(', ')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">${Number(product.price).toFixed(2)}</p>
          {product.comparePrice && (
            <p className="text-xs text-slate-400 line-through">${Number(product.comparePrice).toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};