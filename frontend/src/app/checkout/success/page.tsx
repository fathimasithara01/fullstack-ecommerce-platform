'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data)).catch(console.error);
    }
  }, [orderId]);

  if (!order) return <div className="text-center py-20 text-sm text-slate-400 animate-pulse">Reading verification logs...</div>;

  return (
    <div className="max-w-xl mx-auto py-12 space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">✓</div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed Successfully</h1>
        <p className="text-xs text-slate-400 font-mono">Ledger Node Identifier: {order.id}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Manifest Summary</h3>
        <div className="divide-y divide-slate-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2.5 text-sm font-medium">
              <span className="text-slate-700">{item.productName} <strong className="text-slate-400">x{item.quantity}</strong></span>
              <span className="text-slate-900 font-bold">${Number(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
          <span>Settled Invoice Balance</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center">
        <Link href="/products" className="inline-block rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 transition">
          Continue Shopping Core Index
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-400">Loading Order Confirmation...</div>}>
      <Suspense Content={<SuccessContent />} />
    </Suspense>
  );
}