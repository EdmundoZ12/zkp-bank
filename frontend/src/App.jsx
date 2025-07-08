import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import ZKPLoginSimple from "./components/auth/ZKPLoginSimple";
import ZKPRegister from "./components/auth/ZKPRegister";
import ZKPBankingDashboard from "./components/dashboard/ZKPBankingDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("login"); // 'login' | 'register' | 'dashboard'

  useEffect(() => {
    // Check if user is already logged in
    const token =
      localStorage.getItem("zkp_token") || localStorage.getItem("token");
    const storedUser =
      localStorage.getItem("zkp_user") || localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setCurrentView("dashboard");
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("zkp_token");
        localStorage.removeItem("zkp_user");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log("Login exitoso:", userData);
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleRegisterSuccess = (userData) => {
    console.log("Registro exitoso:", userData);
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    // Limpiar todos los tokens y datos del usuario
    localStorage.removeItem("zkp_token");
    localStorage.removeItem("zkp_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCurrentView("login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ZKP Banking...</p>
        </div>
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
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1f2937",
            border: "1px solid rgba(30, 60, 114, 0.1)",
            borderRadius: "12px",
            backdropFilter: "blur(20px)",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "rgba(16, 185, 129, 0.1)",
              borderColor: "#10b981",
              color: "#065f46",
            },
          },
          error: {
            style: {
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "#ef4444",
              color: "#991b1b",
            },
          },
        }}
      />

      {currentView === "login" && (
        <div className="relative">
          <ZKPLoginSimple
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentView("register")}
          />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={() => setCurrentView("register")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all duration-200"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </div>
      )}

      {currentView === "register" && (
        <div className="relative">
          <ZKPRegister
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentView("login")}
          />
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <button
              onClick={() => setCurrentView("login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-full text-white font-medium shadow-lg transition-all duration-200"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      )}

      {currentView === "dashboard" && user && (
        <ZKPBankingDashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
