import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ZKPLogin from './components/auth/ZKPLogin';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'dashboard'

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setCurrentView('dashboard');
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1f2937',
            border: '1px solid rgba(30, 60, 114, 0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            fontWeight: '500',
          },
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.1)',
              borderColor: '#10b981',
              color: '#065f46',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: '#ef4444',
              color: '#991b1b',
            },
          },
        }}
      />
      
      {currentView === 'login' && (
        <div className="relative">
          <ZKPLogin onLoginSuccess={handleLoginSuccess} />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={() => setCurrentView('register')}
              className="banking-button px-6 py-3 rounded-full text-white font-medium shadow-lg"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </div>
      )}

      {currentView === 'register' && (
        <div className="relative">
          <Register onRegisterSuccess={handleRegisterSuccess} />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={() => setCurrentView('login')}
              className="banking-button px-6 py-3 rounded-full text-white font-medium shadow-lg"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      )}

      {currentView === 'dashboard' && user && (
        <Dashboard user={user} />
      )}
    </>
  );
}

export default App;
