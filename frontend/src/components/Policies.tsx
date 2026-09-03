import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Policies() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/admin/segment-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load AI policies');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
        ))}
      </div>
    );
  }

  const getBadgeClass = (action: string) => {
    if (action.includes('now')) return 'bg-[#0252ea]/10 text-[#0252ea] border-[#0252ea]/20 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
    if (action.includes('later')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50';
    if (action.includes('abandon')) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50';
    return 'badge-neutral';
  };

  return (
    <div className="animate-fade-in mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="page-icon text-lg">⬡</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Policies</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            See how the contextual bandit algorithm adapts its strategy based on success rates.
          </p>
        </div>
      </div>

      {Object.keys(stats).length === 0 ? (
        <div className="empty-state mt-8">
          <div className="empty-icon text-4xl">🧠</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No AI stats available</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Seed the database to generate synthetic events and AI decisions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats).map(([category, actions]: [string, any]) => {
            const sortedActions = [...actions].sort((a, b) => b.success_rate - a.success_rate);
            const bestAction = sortedActions[0];

            return (
              <div key={category} className="glass-card flex flex-col group">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
                      {category.replace(/_/g, ' ')}
                    </h3>
                    {bestAction && bestAction.attempts > 5 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Learned
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-5">
                  {sortedActions.map((act) => (
                    <div key={act.action} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeClass(act.action)}`}>
                          {act.action.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {act.success_rate}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            act === bestAction ? 'bg-[#0252ea]' : 'bg-slate-400 dark:bg-slate-600'
                          }`} 
                          style={{ width: `${Math.max(act.success_rate, 2)}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 text-right font-medium">
                        {act.successes} / {act.attempts} recoveries
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
