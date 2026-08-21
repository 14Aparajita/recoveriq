import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EventQueue from './components/EventQueue';
import AuditLog from './components/AuditLog';
import Landing from './components/Landing';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md p-4 border-b">
          <div className="container mx-auto flex justify-between items-center">
            <span className="text-xl font-bold text-blue-600">RecoverIQ</span>
            <div className="space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Dashboard</Link>
              <Link to="/queue" className="text-gray-700 hover:text-blue-600 transition">Queue</Link>
              <Link to="/audit" className="text-gray-700 hover:text-blue-600 transition">Audit Log</Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/queue" element={<EventQueue />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;