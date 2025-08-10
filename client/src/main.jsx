import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ This is required
import App from './App';
import { Toaster } from 'react-hot-toast';
// import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: '#333', color: '#fff' }
      }}
    />
  </React.StrictMode>
);