import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EventQueue() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/events/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRetry = async (eventId: number) => {
    setRetrying(eventId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/actions/retry/${eventId}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success(`✅ Payment link created: ${res.data.payment_link}`);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Retry failed');
    } finally {
      setRetrying(null);
    }
  };

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
        <div className="page-icon text-lg">⟳</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and manually retry failed payment events.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state mt-8">
          <div className="empty-icon text-4xl">📭</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Queue is empty</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">No pending failed payments to show.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <th className="table-th w-20">ID</th>
                  <th className="table-th">Order</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Decline Code</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Recoverable</th>
                  <th className="table-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {events.map((e) => (
                  <tr key={e.id} className="table-tr">
                    <td className="table-td font-medium">{e.id}</td>
                    <td className="table-td font-mono text-xs">{e.order_id}</td>
                    <td className="table-td font-semibold">₹{parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="table-td">
                      <span className="badge-neutral font-mono">{e.decline_code}</span>
                    </td>
                    <td className="table-td text-slate-600 dark:text-slate-400 capitalize">{e.decline_category?.replace('_', ' ') || '—'}</td>
                    <td className="table-td">
                      <span className={e.ground_truth_recoverable ? 'badge-success' : 'badge-danger'}>
                        {e.ground_truth_recoverable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <button
                        onClick={() => handleRetry(e.id)}
                        disabled={retrying === e.id}
                        className="btn-ghost py-1.5 px-4 text-xs tracking-wide"
                      >
                        {retrying === e.id ? 'Retrying...' : 'Retry Now'}
                      </button>
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