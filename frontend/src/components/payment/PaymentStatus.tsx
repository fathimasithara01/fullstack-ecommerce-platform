import React from 'react';

export const PaymentStatus: React.FC<{ status: 'SUCCESS' | 'FAILED'; errorMsg?: string }> = ({ status, errorMsg }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md mx-auto space-y-4">
      {status === 'SUCCESS' ? (
        <>
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">✓</div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Authorization Settled</h2>
          <p className="text-sm text-slate-500">Transaction pipeline sequence executed successfully.</p>
        </>
      ) : (
        <>
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">✕</div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Authorization Voided</h2>
          <p className="text-sm text-rose-500">{errorMsg || 'The transaction request was rejected by the issuing gateway block.'}</p>
        </>
      )}
    </div>
  );
};