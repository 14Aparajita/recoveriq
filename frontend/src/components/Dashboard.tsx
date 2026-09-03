import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const COLORS = ['#0252ea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/metrics/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMetrics(res.data);
    } catch (err) {
      toast.error('Failed to load metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const seedDatabase = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    const toastId = toast.loading('Seeding database with demo data...');
    try {
      const res = await axios.post(`${API_URL}/api/admin/seed`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.dismiss(toastId);
      toast.success(`🎉 ${res.data.message}`);
      fetchMetrics();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.detail || 'Seeding failed');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse mt-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
        ))}
        <div className="col-span-1 md:col-span-2 h-72 glass-card bg-slate-200/50 dark:bg-slate-800/50 mt-2"></div>
        <div className="col-span-1 md:col-span-2 h-72 glass-card bg-slate-200/50 dark:bg-slate-800/50 mt-2"></div>
      </div>
    );
  }

  if (!metrics || (metrics.recovery_rate === 0 && metrics.revenue_recovered === 0 && metrics.recent_decisions?.length === 0)) {
    return (
      <div className="empty-state mt-12 max-w-2xl mx-auto">
        <div className="empty-icon text-5xl">🚀</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Welcome to RecoverIQ</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Your dashboard is empty. Seed it with 1,000 synthetic failed payment events to see the AI recovery engine in action.
        </p>
        <button
          onClick={seedDatabase}
          className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
        >
          🌱 Seed Demo Data
        </button>
      </div>
    );
  }

  const comparisonData = [
    { name: 'Baseline', rate: metrics.baseline_rate },
    { name: 'RecoverIQ', rate: metrics.recovery_rate },
  ];

  const actionData = [
    { name: 'Retry Now', value: 45 },
    { name: 'Retry Later', value: 25 },
    { name: 'Abandon', value: 20 },
    { name: 'Escalate', value: 10 },
  ];

  const trendData = [
    { day: 'Mon', rate: 20 },
    { day: 'Tue', rate: 35 },
    { day: 'Wed', rate: 48 },
    { day: 'Thu', rate: 56 },
    { day: 'Fri', rate: 62 },
    { day: 'Sat', rate: 71 },
    { day: 'Today', rate: metrics.recovery_rate },
  ];

  return (
    <div className="space-y-6 animate-fade-in mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="page-icon text-lg">📊</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Overview of your recovery performance</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card border-l-4 border-l-[#0252ea]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recovery Rate</p>
          <p className="text-3xl font-black text-[#0252ea] dark:text-blue-400 mt-1">{metrics.recovery_rate}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-auto">
            <div className="bg-[#0252ea] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${metrics.recovery_rate}%` }}></div>
          </div>
        </div>

        <div className="stat-card border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Revenue Recovered</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            <span className="text-xl">₹</span>
            {metrics.revenue_recovered.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="stat-card border-l-4 border-l-slate-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Baseline Recovery</p>
          <p className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-1">{metrics.baseline_rate}%</p>
        </div>

        <div className="stat-card border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Improvement</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">+{metrics.improvement}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Recovery Rate Comparison</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis unit="%" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(v) => `${v}%`} 
                  cursor={{ fill: 'rgba(2, 82, 234, 0.05)' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 500 }} />
                <Bar dataKey="rate" fill="#0252ea" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Action Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={60}
                  dataKey="value"
                  paddingAngle={3}
                  stroke="none"
                >
                  {actionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Recovery Rate Trend (7 Days)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis unit="%" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                <Tooltip 
                  formatter={(v) => `${v}%`} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#0252ea" 
                  strokeWidth={3} 
                  dot={{ fill: '#white', stroke: '#0252ea', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, fill: '#0252ea', stroke: 'white', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="glass-card flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Decisions</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            {metrics.recent_decisions?.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {metrics.recent_decisions.slice(0, 6).map((d: any) => (
                  <li key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Event #{d.event_id}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5" title={d.justification}>
                        {d.justification}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      d.action === 'retry_now' ? 'bg-[#0252ea]/10 text-[#0252ea] dark:bg-blue-900/30 dark:text-blue-400' :
                      d.action === 'retry_later' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      d.action === 'abandon' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {d.action.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No decisions logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}