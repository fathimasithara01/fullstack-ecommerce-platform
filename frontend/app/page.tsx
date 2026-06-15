import React from 'react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 lg:py-20 text-center">
      <div className="max-w-3xl">
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-4">
          Phase 1 Deployment Active
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          The Next-Generation <span className="text-indigo-600">SaaS Commerce Architecture</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
          A high-performance storefront driven by Next.js App Router combined with a robust decoupled distributed background transaction pipeline engine.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Browse Marketplace
          </button>
          <a href="/docs" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition">
            Read System Specs <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="mt-16 w-full max-w-5xl border border-slate-200 rounded-xl bg-white p-6 shadow-sm text-left">
        <h3 className="font-semibold text-slate-900 mb-4">System Core Status Grid</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium">DATABASE ENGINE</div>
            <div className="text-sm font-semibold text-emerald-600 mt-1">Prisma + PostgreSQL Active</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium">CORE SERVICE LIFECYCLE</div>
            <div className="text-sm font-semibold text-emerald-600 mt-1">Express.js API Node Ready</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium">PAYMENT STRATEGY GATEWAY</div>
            <div className="text-sm font-semibold text-indigo-600 mt-1">Stripe Middleware Setup Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}