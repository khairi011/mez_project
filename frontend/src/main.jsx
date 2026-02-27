import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Global unhandled error handlers — ensures ALL errors appear in the console
window.addEventListener('error', (event) => {
  console.error('🔴 [Global Error]', event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 [Unhandled Promise Rejection]', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)