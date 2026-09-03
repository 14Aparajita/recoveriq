import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Dashboard from './components/Dashboard';
import EventQueue from './components/EventQueue';
import AuditLog from './components/AuditLog';
import Landing from './components/Landing';
import Login from './components/Login';
import Signup from './components/Signup';
import Evaluation from './components/Evaluation';
import Settings from './components/Settings';
import Analytics from './components/Analytics';
import Merchants from './components/Merchants';
import Notifications from './components/Notifications';
import WebhookLogs from './components/WebhookLogs';
import Profile from './components/Profile';
import Policies from './components/Policies';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Sync with settings changes from other components
  useEffect(() => {
    const handleThemeChange = () => {
      const stored = localStorage.getItem('theme') === 'dark';
      setDark(stored);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  return (
    <BrowserRouter>
      {/* Container needs a subtle global bg */}
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans selection:bg-[#0252ea]/15">
        <Navbar dark={dark} setDark={setDark} />

        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-10 animate-fade-in relative z-10 min-h-[calc(100vh-140px)]">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><EventQueue /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLog /></ProtectedRoute>} />
            <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/merchants" element={<ProtectedRoute><Merchants /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/webhook-logs" element={<ProtectedRoute><WebhookLogs /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>

        <footer className="py-6 text-center text-[13px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          Built for RecoverIQ – AI Revenue Recovery Track
        </footer>
        
        <Toaster 
          position="bottom-center" 
          toastOptions={{ 
            duration: 4000,
            className: 'text-sm font-medium rounded-xl shadow-card-lg',
            style: {
              background: dark ? '#1e293b' : '#ffffff',
              color: dark ? '#f8fafc' : '#0f172a',
              border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
            },
          }} 
        />
      </div>
    </BrowserRouter>
  );
}

export default App;