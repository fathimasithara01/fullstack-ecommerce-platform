'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function FailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const errorMsg = searchParams.get('msg');

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">✕</div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settlement Transaction Dropped</h1>
        <p className="text-sm text-rose-500 font-medium bg-rose-50/50 p-3 rounded border border-rose-100">{errorMsg || 'The payment request failed verification processing steps.'}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => router.push('/cart')}
          className="flex-1 text-center rounded-md border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          Return to Shopping Cart
        </button>
        <button
          onClick={() => router.push(`/checkout/payment?orderId=${orderId}`)}
          className="flex-1 text-center rounded-md bg-indigo-600 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          Retry Settlement Sequence
        </button>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-400">Loading Error Diagnostics View...</div>}>
      <FailedContent />
    </Suspense>
  );
}