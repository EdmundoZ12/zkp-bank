import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ZKPRegister from './ZKPRegister';
import ZKPLoginSimple from './ZKPLoginSimple';

const AuthMain = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState('login'); // 'login' o 'register'

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleAuthSuccess = (response) => {
    // Llamar al callback del componente padre
    onAuthSuccess(response);
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {currentView === 'login' ? (
        <ZKPLoginSimple 
          onLoginSuccess={handleAuthSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <ZKPRegister 
          onRegisterSuccess={handleAuthSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
};

export default AuthMain;
