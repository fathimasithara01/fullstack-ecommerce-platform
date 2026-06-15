'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useOrderById } from '../../../hooks/useOrders';
import { OrderTimeline } from '../../../components/orders/OrderTimeline';

export default function OrderTrackingDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: order, isLoading } = useOrderById(id);

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400">Querying transaction trace maps...</div>;
  if (!order) return <div className="text-center py-20 text-slate-500">Trace map reference mismatch. Record absent.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-8 py-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Receipt Token Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">Reference UUID Hash: {order.id}</p>
        </div>
        <span className="text-base font-black text-slate-900">${Number(order.total).toFixed(2)}</span>
      </div>

      <OrderTimeline status={order.status} />

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manifest Line Item Logs</h3>
        <div className="divide-y divide-slate-100 border-y border-slate-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-slate-700 font-medium">{item.productName} <strong className="text-slate-400">x{item.quantity}</strong></span>
              <span className="font-bold text-slate-900">${Number(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}