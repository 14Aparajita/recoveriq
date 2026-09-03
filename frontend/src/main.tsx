import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import api from './api/axios';  // ensure the interceptor is set up

// Just import to initialize the interceptor – it will be used by components later
console.log('API interceptor loaded');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);