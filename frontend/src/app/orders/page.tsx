'use client';

import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { OrderCard } from '../../components/orders/OrderCard';

export default function CustomerOrdersOverviewDashboard() {
  const { data: orders, isLoading } = useOrders();

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Order Lifecycle Dashboard</h2>
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-lg border border-slate-100" />)}
        </div>
      ) : !orders || orders.length === 0 ? (
        <p className="text-sm text-slate-500">No transactions recorded inside this user profile identifier frame.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}