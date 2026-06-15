'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';

export const CouponInput: React.FC<{ totalAmount: number; onApply: (coupon: any, discount: number) => void }> = ({ totalAmount, onApply }) => {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  const handleApply = async () => {
    try {
      const res = await api.post('/coupons/validate', { code, orderAmount: totalAmount });
      const coupon = res.data.data;
      let calculatedDiscount = coupon.discountType === 'PERCENTAGE' ? totalAmount * (Number(coupon.discountValue) / 100) : Number(coupon.discountValue);
      onApply(coupon, calculatedDiscount);
      setMsg(`Success. Deduction applied: $${calculatedDiscount.toFixed(2)}`);
    } catch (err: any) {
      setMsg(err.message || 'Invalid coupon token matrix string value.');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase">Apply Promotion Shield</label>
      <div className="flex gap-2">
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="rounded border border-slate-300 px-3 py-1 text-sm shadow-sm focus:outline-none" placeholder="PROMO2026" />
        <button onClick={handleApply} className="rounded bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition">Apply</button>
      </div>
      {msg && <p className="text-xs font-medium text-indigo-600">{msg}</p>}
    </div>
  );
};