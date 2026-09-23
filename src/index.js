import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { ToastProvider } from './components/Toast/Toast';
import { AppDataProvider } from './data/useAppData';
import './styles/global.css';
import './styles/globalDark.css';

// Apply the saved theme before first paint so every page (including login/register,
// which have no nav bar) respects it.
try {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
  }
} catch { /* storage unavailable — default to light */ }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppDataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppDataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);