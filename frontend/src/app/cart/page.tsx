'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../hooks/useCart';
import { useCartStore } from '../../store/cartStore';
import { CartItemComponent } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { CouponInput } from '../../components/cart/CouponInput';

export default function CartLayoutPage() {
  const router = useRouter();
  const { cart, removeItem } = useCart();
  const { discount, applyCoupon } = useCartStore();

  const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const tax = (subtotal - discount) * 0.18;
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = (subtotal - discount) + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl max-w-md mx-auto mt-10">
        <h2 className="text-lg font-bold text-slate-800">Your shopping matrix layout is completely empty.</h2>
        <button onClick={() => router.push('/products')} className="mt-4 rounded bg-indigo-600 px-4 py-2 text-xs font-bold text-white">Browse Inventory Index</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
      <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Core Allocations Grid</h2>
        <div className="divide-y divide-slate-100">
          {cart.map((item) => (
            <CartItemComponent key={item.id} item={item} onRemove={removeItem} onUpdate={() => {}} />
          ))}
        </div>
        <div className="pt-4"><CouponInput totalAmount={subtotal} onApply={applyCoupon} /></div>
      </div>
      <div>
        <CartSummary subtotal={subtotal} discount={discount} tax={tax} shipping={shipping} total={total} onCheckout={() => router.push('/checkout')} />
      </div>
    </div>
  );
}