import React from 'react';

export const AddressSelector: React.FC<{ addresses: any[]; selectedId: string; onSelect: (id: string) => void }> = ({ addresses, selectedId, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Select Target Delivery Link</h3>
      {addresses.length === 0 ? (
        <p className="text-sm text-slate-500">No active address fields configured.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => onSelect(addr.id)}
              className={`cursor-pointer rounded-lg border p-4 transition-all ${selectedId === addr.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <p className="text-sm font-bold text-slate-800">{addr.fullName}</p>
              <p className="text-xs text-slate-600 mt-1">{addr.street}, {addr.city}</p>
              <p className="text-xs text-slate-400 mt-0.5">{addr.state}, {addr.pincode}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};