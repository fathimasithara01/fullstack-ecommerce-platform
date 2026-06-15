import React from 'react';
import Link from 'next/link';

export const OrderCard: React.FC<{ order: any }> = ({ order }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-indigo-600">ID: {order.id.substring(0, 8).toUpperCase()}</p>
        <p className="text-xs text-slate-400 mt-0.5">Transactions run date: {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="text-sm font-extrabold text-slate-800 mt-2">Valuation Amount: ${Number(order.total).toFixed(2)}</p>
      </div>
      <div className="text-right">
        <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-bold tracking-wide ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {order.status}
        </span>
        <br />
        <Link href={`/orders/${order.id}`} className="inline-block mt-3 text-xs font-bold text-indigo-600 hover:underline">Track Lifecycle →</Link>
      </div>
    </div>
  );
};