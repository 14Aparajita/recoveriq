import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🧠',
    title: 'AI Decision Engine',
    desc: 'LLM + contextual bandit policy automatically classifies decline reasons and selects the optimal recovery action.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-800/30',
  },
  {
    icon: '💰',
    title: 'Revenue Recovery',
    desc: 'Intelligently retry failed payments at the right time with the right strategy to maximize recovery rate.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800/30',
  },
  {
    icon: '📋',
    title: 'Full Audit Trail',
    desc: 'Every AI decision logged, timestamped, and explained — full transparency for every payment action taken.',
    color: 'from-blue-500 to-sky-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/30',
  },
  {
    icon: '📊',
    title: 'Live Analytics',
    desc: 'Real-time dashboards showing recovery rates, revenue trends, and AI policy learning over time.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/30',
  },
  {
    icon: '🔗',
    title: 'RecoverIQ Native',
    desc: 'Deep integration with Payment APIs — payment links, webhooks, and merchant management built-in.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-100 dark:border-rose-800/30',
  },
  {
    icon: '🛡️',
    title: 'Merchant Policies',
    desc: 'Per-merchant customizable recovery policies with bandit learning that improves automatically.',
    color: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/50',
  },
];

const stats = [
  { value: '72%', label: 'Recovery Rate' },
  { value: '₹4.2L', label: 'Avg Revenue Saved' },
  { value: '<2s', label: 'Decision Latency' },
  { value: '100%', label: 'Audit Coverage' },
];

export default function Landing() {
  const token = localStorage.getItem('token');

  return (
    <div className="animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative text-center py-20 sm:py-28 px-4 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-[#0252ea]/8 via-blue-400/5 to-violet-400/8 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 bg-[#eef3fe] dark:bg-[#0252ea]/15 text-[#0252ea] dark:text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-[#0252ea]/15 dark:border-blue-500/20 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0252ea] animate-pulse" />
          RecoverIQ Platform 2026
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
          <span className="text-slate-900 dark:text-white">Recover Lost</span>
          <br />
          <span className="gradient-text">Revenue Intelligently</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          RecoverIQ is an AI-powered failed payment recovery engine for merchants.
          It classifies decline reasons, picks the optimal retry strategy, and executes — automatically.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to={token ? '/dashboard' : '/signup'}
            className="btn-primary text-base px-8 py-3.5"
          >
            {token ? 'Go to Dashboard' : 'Get Started Free'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="btn-secondary text-base px-8 py-3.5"
          >
            Learn More
          </a>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto glass-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-[#0252ea] dark:text-blue-400">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-header">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need to recover revenue
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto">
              A complete suite of AI-powered tools to detect, classify, and recover failed payments at scale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div
                key={f.title}
                className={`glass-card p-6 border ${f.border} hover:-translate-y-1 transition-transform duration-200 cursor-default`}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center text-2xl mb-4 border ${f.border}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0252ea]/5 to-blue-400/5 pointer-events-none" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to recover your revenue?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Start with demo data in seconds. No credit card required.
          </p>
          <Link to={token ? '/dashboard' : '/signup'} className="btn-primary text-base px-10 py-3.5">
            {token ? 'Open Dashboard' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}