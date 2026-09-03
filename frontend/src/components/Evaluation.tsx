import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Evaluation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/eval/cumulative`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-10">Loading evaluation...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">📈 AI Performance Evaluation</h1>
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Cumulative Revenue Recovered</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="step" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-4 text-sm text-gray-500">This shows how the AI improves over time as it learns.</p>
      </div>
    </div>
  );
}