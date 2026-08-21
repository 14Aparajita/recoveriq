import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AuditLog() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/decisions/`);
      setDecisions(res.data);
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Log – All Decisions</h1>
      {decisions.length === 0 ? (
        <p className="text-gray-500">No decisions logged yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LLM Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {decisions.map((d) => (
                <tr key={d.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{d.event_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      d.action === 'retry_now' ? 'bg-blue-100 text-blue-800' :
                      d.action === 'retry_later' ? 'bg-yellow-100 text-yellow-800' :
                      d.action === 'abandon' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {d.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{d.confidence ? (d.confidence * 100).toFixed(0) + '%' : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{d.justification}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{d.llm_used ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}