'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../store/cartStore';
import { AddressSelector } from '../../components/checkout/AddressSelector';
import { CartSummary } from '../../components/cart/CartSummary';

export default function CheckoutMultiStepPage() {
  const router = useRouter();
  const { cart } = useCart();
  const { discount, coupon, clearCart } = useCartStore();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/addresses').then((res) => {
      setAddresses(res.data.data);
      if (res.data.data.length > 0) setSelectedAddressId(res.data.data[0].id);
    }).catch(console.error);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const tax = (subtotal - discount) * 0.18;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = (subtotal - discount) + tax + shipping;

  const handleFinalizeOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        addressId: selectedAddressId,
        couponCode: coupon?.code,
      });
      clearCart();
      router.push(`/orders/${res.data.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Order submission pipeline validation block exception occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
      <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {step === 1 ? (
          <div className="space-y-6">
            <AddressSelector addresses={addresses} selectedId={selectedAddressId} onSelect={setSelectedAddressId} />
            <button
              disabled={!selectedAddressId}
              onClick={() => setStep(2)}
              className="rounded bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
            >
              Proceed to Verification Review
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Review Allocations Strategy Before Transmission</h3>
            <p className="text-xs text-slate-500 font-semibold">Delivery Endpoint Mapping Configured Token: <span className="text-slate-800">{selectedAddressId}</span></p>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="rounded border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Back</button>
              <button
                disabled={loading}
                onClick={handleFinalizeOrder}
                className="rounded bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition shadow"
              >
                {loading ? 'Processing System Locks...' : 'Authorize Frame Dispatch Balance'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        <CartSummary subtotal={subtotal} discount={discount} tax={tax} shipping={shipping} total={total} />
      </div>
    </div>
  );
}