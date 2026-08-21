import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">RecoverIQ</h1>
          <p className="text-xl text-gray-600 mb-8">AI-Powered Failed Payment Recovery for Razorpay Merchants</p>
          <div className="flex justify-center gap-4">
            <Link to="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Go to Dashboard
            </Link>
            <a href="#features" className="bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition">
              Learn More
            </a>
          </div>
        </div>
        <div id="features" className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold">AI Decision Engine</h3>
            <p className="text-gray-600">Classifies decline reasons and chooses optimal recovery actions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold">Revenue Recovery</h3>
            <p className="text-gray-600">Recovers lost revenue from failed payments intelligently</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold">Full Audit Trail</h3>
            <p className="text-gray-600">Every decision is logged, explainable, and auditable</p>
          </div>
        </div>
      </div>
    </div>
  );
}