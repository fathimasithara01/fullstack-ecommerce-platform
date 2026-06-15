import React from 'react';

export const OrderTimeline: React.FC<{ status: string }> = ({ status }) => {
  const vectors = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const activeIdx = vectors.indexOf(status);

  return (
    <div className="flex items-center justify-between max-w-xl mx-auto py-6">
      {vectors.map((step, idx) => (
        <div key={step} className="flex flex-col items-center relative flex-1">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${idx <= activeIdx ? 'bg-indigo-600 text-white shadow' : 'bg-slate-200 text-slate-500'}`}>
            {idx + 1}
          </div>
          <span className={`text-xs font-bold mt-2 tracking-tight ${idx <= activeIdx ? 'text-indigo-600' : 'text-slate-400'}`}>{step}</span>
          {idx < vectors.length - 1 && (
            <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ${idx < activeIdx ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};