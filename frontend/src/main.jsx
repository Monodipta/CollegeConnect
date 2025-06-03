import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './components/theme-provider/theme-provider.jsx';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster component

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap your App component with ThemeProvider */}
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
      <Toaster /> {/* This is where the Toast messages will be rendered */}
    </ThemeProvider>
  </React.StrictMode>
);