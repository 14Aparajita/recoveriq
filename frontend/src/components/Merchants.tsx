import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Merchants() {
  const [merchants, setMerchants] = useState([]);
  const [name, setName] = useState('');
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMerchants = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/merchants/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMerchants(res.data);
    } catch (err) {
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const addMerchant = async () => {
    if (!name.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/merchants/`, { 
        name, 
        razorpay_key_id: rzpKeyId, 
        razorpay_key_secret: rzpKeySecret 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Merchant added');
      setName('');
      setRzpKeyId('');
      setRzpKeySecret('');
      fetchMerchants();
    } catch (err) {
      toast.error('Failed to add merchant');
    }
  };

  const deleteMerchant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this merchant?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/merchants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Deleted');
      fetchMerchants();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8 animate-pulse space-y-6">
        <div className="h-64 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 glass-card bg-slate-200/50 dark:bg-slate-800/50"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="page-icon text-lg">🏪</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Merchants</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage merchant accounts linked to RecoverIQ.</p>
        </div>
      </div>

      <div className="glass-card p-6 mb-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background for form */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0252ea]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 relative z-10">Add New Merchant</h3>
        
        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Merchant Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field py-2.5 px-4"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Key ID</label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={rzpKeyId}
                onChange={(e) => setRzpKeyId(e.target.value)}
                className="input-field py-2.5 px-4"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Key Secret</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={rzpKeySecret}
                onChange={(e) => setRzpKeySecret(e.target.value)}
                className="input-field py-2.5 px-4"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              onClick={addMerchant} 
              disabled={!name.trim()}
              className="btn-primary py-2.5 px-6 w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Merchant
            </button>
          </div>
        </div>
      </div>
      
      {merchants.length === 0 ? (
        <div className="empty-state py-12 border border-dashed border-slate-300 dark:border-slate-700 bg-transparent shadow-none">
          <div className="empty-icon text-3xl bg-slate-100 dark:bg-slate-800/50 mb-4 w-16 h-16">🏪</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No merchants added yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="glass-card">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {merchants.map((m: any) => (
              <li key={m.id} className="p-4 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#eef3fe] dark:bg-[#0252ea]/15 flex items-center justify-center text-[#0252ea] dark:text-blue-400 font-bold text-lg shadow-sm border border-[#0252ea]/10 dark:border-[#0252ea]/20">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 block">{m.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">ID: {m.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteMerchant(m.id)} 
                  className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Merchant"
                  aria-label="Delete Merchant"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}