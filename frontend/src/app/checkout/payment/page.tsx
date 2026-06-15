'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { StripeProvider } from '../../../components/payment/StripeProvider';
import { PaymentForm } from '../../../components/payment/PaymentForm';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [clientSecret, setClientSecret] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!orderId) {
      setErr('Order execution path trace contextual routing missing string components.');
      return;
    }

    api.post('/payments/create-intent', { orderId })
      .then((res) => setClientSecret(res.data.data.clientSecret))
      .catch((e) => setErr(e.response?.data?.message || 'Failed initializing Stripe Payment Intent subsystem.'));
  }, [orderId]);

  if (err) return <div className="text-center py-20 text-sm font-semibold text-rose-500">{err}</div>;
  if (!clientSecret) return <div className="text-center py-20 text-sm font-medium text-slate-400 animate-pulse">Initializing direct secure gateway links...</div>;

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Secure Payment Settlement Channel</h2>
        <StripeProvider clientSecret={clientSecret}>
          <PaymentForm
            orderId={orderId!}
            onSuccess={() => router.push(`/checkout/success?orderId=${orderId}`)}
            onFailure={(msg) => router.push(`/checkout/failed?orderId=${orderId}&msg=${encodeURIComponent(msg)}`)}
          />
        </StripeProvider>
      </div>
    </div>
  );
}

export default function CheckoutPaymentRoutingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-sm text-slate-400">Loading Payment View Shell...</div>}>
      <PaymentContent />
    </Suspense>
  );
}