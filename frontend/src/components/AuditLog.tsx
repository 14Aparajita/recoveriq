import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuditLog() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/decisions/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        setDecisions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse mt-8 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 glass-card bg-slate-200/50 dark:bg-slate-800/50 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="page-icon text-lg">≡</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">A complete, transparent record of all AI decisions.</p>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="empty-state mt-8">
          <div className="empty-icon text-4xl">📋</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No log entries</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Actions taken by the AI will appear here.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="table-th w-20">ID</th>
                  <th className="table-th">Event</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Confidence</th>
                  <th className="table-th">Justification</th>
                  <th className="table-th">LLM Used</th>
                  <th className="table-th text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {decisions.map((d) => (
                  <tr key={d.id} className="table-tr">
                    <td className="table-td font-medium">{d.id}</td>
                    <td className="table-td font-mono text-xs">{d.event_id}</td>
                    <td className="table-td">
                      <span className={`badge-neutral ${
                        d.action === 'retry_now' ? 'bg-[#0252ea]/10 text-[#0252ea] border-[#0252ea]/20 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                        d.action === 'retry_later' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
                        d.action === 'abandon' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50' : ''
                      }`}>
                        {d.action.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="table-td font-medium text-slate-600 dark:text-slate-300">
                      {d.confidence ? (d.confidence * 100).toFixed(0) + '%' : '—'}
                    </td>
                    <td className="table-td max-w-xs truncate" title={d.justification}>
                      {d.justification}
                    </td>
                    <td className="table-td">
                      {d.llm_used ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Fallback
                        </span>
                      )}
                    </td>
                    <td className="table-td text-right text-xs text-slate-500">
                      {new Date(d.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}