import React from 'react';
import Image from 'next/image';

export const CartItemComponent: React.FC<{ item: any; onRemove: (id: string) => void; onUpdate: (id: string, q: number) => void }> = ({ item, onRemove, onUpdate }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded bg-slate-50">
          <Image src={item.product.images[0] || '/placeholder.png'} alt={item.product.name} fill className="object-cover" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{item.product.name}</h4>
          <p className="text-xs text-slate-500">${Number(item.product.price).toFixed(2)} USD</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center rounded border border-slate-200">
          <button onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))} className="px-2 text-slate-500 hover:bg-slate-50">-</button>
          <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
          <button onClick={() => onUpdate(item.id, item.quantity + 1)} className="px-2 text-slate-500 hover:bg-slate-50">+</button>
        </div>
        <button onClick={() => onRemove(item.id)} className="text-xs font-semibold text-rose-500 hover:underline">Purge</button>
      </div>
    </div>
  );
};