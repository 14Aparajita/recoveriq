import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AlertsBell() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    // Setup WebSocket
    const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_alert') {
          fetchAlerts(); // refresh list
        }
      } catch (e) { /* ignore */ }
    };
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/alerts/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data.slice(0, 10));
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id: number) => {
    const token = localStorage.getItem('token');
    await axios.put(`${API_URL}/api/alerts/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAlerts();
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 glass rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex justify-between">
            Notifications
            <Link to="/notifications" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No alerts</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`p-3 border-b border-gray-100 dark:border-gray-700 ${!alert.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex justify-between items-start">
                  <span className="text-sm">{alert.message}</span>
                  {!alert.read && (
                    <button onClick={() => markRead(alert.id)} className="text-xs text-blue-500">Mark read</button>
                  )}
                </div>
                <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}