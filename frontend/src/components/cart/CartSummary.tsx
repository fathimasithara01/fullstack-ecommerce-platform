import React from 'react';

export const CartSummary: React.FC<{ subtotal: number; discount: number; tax: number; shipping: number; total: number; onCheckout?: () => void }> = ({
  subtotal, discount, tax, shipping, total, onCheckout
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Transaction Summary</h3>
      <div className="space-y-2 text-sm font-medium text-slate-600">
        <div className="flex justify-between"><span>Subtotal Allocation</span><span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-emerald-600"><span>Coupon Value Deductions</span><span>-${discount.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>GST Core Matrix (18%)</span><span className="font-bold text-slate-800">${tax.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping & Routing Costs</span><span className="font-bold text-slate-800">${shipping.toFixed(2)}</span></div>
        <hr className="border-slate-100" />
        <div className="flex justify-between text-base font-extrabold text-slate-900"><span>Total Ledger Balance</span><span>${total.toFixed(2)}</span></div>
      </div>
      {onCheckout && (
        <button onClick={onCheckout} className="w-full mt-2 rounded bg-indigo-600 py-2.5 text-center text-sm font-bold text-white shadow hover:bg-indigo-500 transition">
          Initiate Checkout Routine
        </button>
      )}
    </div>
  );
};