import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EventQueue() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events/`);
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Failed Payment Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-500">No events. Generate synthetic data first.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Decline Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recoverable</th>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => handleRetry(e.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </td>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.order_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{e.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.decline_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.decline_category || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${e.ground_truth_recoverable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {e.ground_truth_recoverable ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}