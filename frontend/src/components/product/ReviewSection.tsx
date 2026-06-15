import React from 'react';

export const ReviewSection: React.FC<{ reviews: any[] }> = ({ reviews }) => {
  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Verified Consumer Feedback Loops</h3>
      {reviews.length === 0 ? (
        <p className="text-sm text-slate-500">No verified tracking record available yet.</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {reviews.map((r) => (
            <div key={r.id} className="py-4 space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {r.user.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{r.user.name}</h4>
                  <span className="text-xs text-amber-500">{'★'.repeat(r.rating)}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 pl-11">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};