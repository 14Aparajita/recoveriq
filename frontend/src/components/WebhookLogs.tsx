import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function WebhookLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/webhook-logs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      toast.error('Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 animate-pulse mt-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 glass-card rounded-xl bg-slate-200/50 dark:bg-slate-700/50"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in mt-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">🔗</span>
        <span className="text-slate-800 dark:text-slate-100">Webhook Logs</span>
      </h1>
      
      {logs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <span className="text-2xl">📡</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No webhooks received</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Events sent by payment gateway will appear here.</p>
        </div>
      ) : (
        <div className="glass-card">
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {logs.map((log: any) => (
              <li key={log.id} className="p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      log.processed === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 
                      log.processed === 2 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}>
                      {log.processed === 1 ? 'SUCCESS' : log.processed === 2 ? 'FAILED' : 'PENDING'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{log.event_type}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                
                {log.error_message && (
                  <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm border border-rose-100 dark:border-rose-900/30">
                    <strong>Error:</strong> {log.error_message}
                  </div>
                )}
                
                <details className="mt-3 group">
                  <summary className="text-sm font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
                    <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View Payload
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs overflow-auto max-h-64 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}