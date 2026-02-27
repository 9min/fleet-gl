import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './app.css';

// Apply initial theme before first render
const stored = localStorage.getItem('theme') as 'dark' | 'light' | 'system' | null;
const initial = stored ?? 'dark';
const resolved = initial === 'system'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : initial;
document.documentElement.setAttribute('data-theme', resolved);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
