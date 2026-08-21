import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricsCard from './MetricsCard';
import LoadingSpinner from './LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Add chart component with your data

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/metrics/dashboard`);
      setMetrics(res.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!metrics) return <div className="text-center p-10 text-red-500">No metrics available. Make sure the backend is running and data is seeded.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricsCard title="Recovery Rate" value={`${metrics.recovery_rate}%`} color="blue" />
        <MetricsCard title="Revenue Recovered" value={`₹${metrics.revenue_recovered.toFixed(2)}`} color="green" />
        <MetricsCard title="Baseline Recovery" value={`${metrics.baseline_rate}%`} color="gray" />
        <MetricsCard title="Improvement" value={`${metrics.improvement}%`} color="purple" />
      </div>
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Decisions</h2>
        {metrics.recent_decisions && metrics.recent_decisions.length > 0 ? (
          <ul className="divide-y">
            {metrics.recent_decisions.map((d: any) => (
              <li key={d.id} className="py-3 flex justify-between items-center">
                <span className="text-gray-700">Event #{d.event_id} – <strong>{d.action}</strong></span>
                <span className="text-sm text-gray-500">{d.justification}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No decisions logged yet.</p>
        )}
      </div>
    </div>
  );
}