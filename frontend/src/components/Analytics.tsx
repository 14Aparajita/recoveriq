import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/analytics/?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setData(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const exportCSV = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    window.open(`${API_URL}/api/analytics/export?start_date=${startDate}&end_date=${endDate}&token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="animate-pulse mt-8 space-y-6">
        <div className="flex gap-4 mb-8">
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-12 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl ml-auto"></div>
        </div>
        <div className="h-[350px] glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalEvents = data.reduce((s, d: any) => s + d.total_events, 0);
  const totalRecovered = data.reduce((s, d: any) => s + d.recovered_count, 0);
  const totalRevenue = data.reduce((s, d: any) => s + d.revenue_recovered, 0);

  return (
    <div className="animate-fade-in mt-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="page-icon text-lg">↗</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Historical trends and detailed metrics.</p>
        </div>
      </div>
      
      <div className="glass-card p-5 mb-8 flex flex-col md:flex-row gap-5 items-end justify-between bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex gap-4 flex-wrap w-full md:w-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field py-2 px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field py-2 px-3 text-sm" />
          </div>
        </div>
        <button onClick={exportCSV} className="btn-secondary py-2.5 px-4 flex items-center gap-2 whitespace-nowrap text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>
      
      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon text-4xl">📉</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No data available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
            There is no analytics data for the selected period. Adjust your date range or seed the database.
          </p>
        </div>
      ) : (
        <>
          <div className="glass-card p-6 mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">Recovery Rate Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis unit="%" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="avg_recovery_rate" stroke="#0252ea" strokeWidth={3} dot={{ fill: '#white', stroke: '#0252ea', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#0252ea', stroke: 'white', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card border-l-4 border-l-[#0252ea]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Events</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalEvents.toLocaleString()}</p>
            </div>
            <div className="stat-card border-l-4 border-l-emerald-500">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recovered</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{totalRecovered.toLocaleString()}</p>
            </div>
            <div className="stat-card border-l-4 border-l-amber-500">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Revenue Recovered</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                <span className="text-xl text-slate-500 dark:text-slate-400 font-bold mr-1">₹</span>
                {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
