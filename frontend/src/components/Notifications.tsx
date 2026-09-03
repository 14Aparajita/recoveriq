import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Notifications() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/alerts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    
    // Setup WebSocket for real-time updates
    const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_alert') {
          fetchAlerts();
        }
      } catch (e) { /* ignore */ }
    };
    return () => ws.close();
  }, []);

  const markRead = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/api/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      const unread = alerts.filter(a => !a.read);
      for (let a of unread) {
        await axios.put(`${API_URL}/api/alerts/${a.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setAlerts(alerts.map(a => ({ ...a, read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  const sendTestAlert = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/alerts/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Test notification sent!');
    } catch (err) {
      toast.error('Failed to send test alert');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8 animate-pulse space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
        ))}
      </div>
    );
  }

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="page-icon text-lg">🔔</div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Alerts, updates, and system notifications.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={sendTestAlert} 
            className="btn-secondary py-2 px-4 text-sm w-full sm:w-auto"
          >
            Send Test Alert
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead} 
              className="text-[#0252ea] dark:text-blue-400 hover:text-[#0144c4] dark:hover:text-blue-300 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state border border-dashed border-slate-300 dark:border-slate-700 bg-transparent shadow-none">
          <div className="empty-icon text-3xl bg-slate-100 dark:bg-slate-800/50 mb-4 w-16 h-16">📭</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">You're all caught up!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="glass-card">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {alerts.map((a: any) => (
              <li 
                key={a.id} 
                className={`p-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 transition-colors ${
                  !a.read ? 'bg-[#eef3fe]/50 dark:bg-[#0252ea]/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!a.read ? 'bg-[#0252ea]' : 'bg-transparent'}`} />
                  <div>
                    <p className={`text-sm ${!a.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {a.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 font-medium">
                      {new Date(a.created_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {!a.read && (
                  <button 
                    onClick={() => markRead(a.id)} 
                    className="self-start sm:self-auto ml-6 sm:ml-0 text-xs font-semibold text-[#0252ea] dark:text-blue-400 hover:text-[#0144c4] dark:hover:text-blue-300 transition-colors whitespace-nowrap bg-[#0252ea]/5 dark:bg-[#0252ea]/10 hover:bg-[#0252ea]/10 dark:hover:bg-[#0252ea]/20 px-3 py-1.5 rounded-lg"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}