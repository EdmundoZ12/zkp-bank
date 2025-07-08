// frontend/src/components/dashboard/BankDashboard.jsx
import React, { useState } from "react";
import ZKPComparison from "../comparison/ZKPComparison";
import SystemStatus from "./SystemStatus";
import EndpointTester from "./EndpointTester";

const BankDashboard = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [showEndpointTester, setShowEndpointTester] = useState(false);

  // Si está en vista de comparación, mostrar ese componente
  if (currentView === "comparison") {
    return (
      <ZKPComparison user={user} onBack={() => setCurrentView("dashboard")} />
    );
  }

  // Vista principal del dashboard
  return (
    <div className="bank-layout">
      {/* Header Corporativo */}
      <header className="bank-header">
        <div className="bank-container">
          <div className="flex justify-between items-center py-4">
            {/* Logo y Navegación */}
            <div className="bank-logo">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏛️</span>
              </div>
              <div>
                <h1 className="bank-title text-xl text-gray-900">ZKBank</h1>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  DIGITAL BANKING PLATFORM
                </p>
              </div>
            </div>

            {/* Navegación Superior */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Panel Principal
              </button>
              <button
                onClick={() => setCurrentView("comparison")}
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Comparación ZKP
              </button>
              <button
                onClick={() => setShowSystemStatus(true)}
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                🔧 Estado Sistema
              </button>
              <button
                onClick={() => setShowEndpointTester(true)}
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                🧪 Probar APIs
              </button>
              <a
                href="#"
                className="text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                Configuración
              </a>
            </nav>

            {/* Perfil y Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.usuario?.username || user?.username || 'Usuario'}
                </p>
                <p className="text-xs text-gray-600">Sesión Autorizada ZKP</p>
              </div>
              <button
                onClick={onLogout}
                className="btn-bank-secondary text-sm px-4 py-2"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="bank-container py-8">
        {/* Banner de Estado */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 text-white elevation-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  Acceso Autorizado
                </h2>
                <p className="text-green-100">
                  Sesión autenticada mediante protocolo {user?.metodo || 'ZK-SNARKs'} • Zero
                  Knowledge Proof
                </p>
                <div className="flex items-center mt-3 space-x-4">
                  <span className="badge-success">🔐 Autenticado</span>
                  <span className="text-xs text-green-200">
                    Tiempo de sesión: 15:42
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white bg-opacity-15 rounded-lg px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-green-100 uppercase tracking-wide">
                    Protocolo ZKP
                  </p>
                  <p className="text-lg font-bold">
                    {user?.metodo || 'ZK-SNARKS'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Panel Principal - Información de Cuenta */}
          <div className="lg:col-span-8">
            <div className="card-bank-corporate">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-700">👤</span>
                  </div>
                  Información de Cuenta Corporativa
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Datos de Cuenta */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      ID Usuario:
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {user?.usuario?.username || user?.username || 'Usuario'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Número de Cuenta:
                    </span>
                    <span className="text-sm font-semibold text-gray-900 font-mono">
                      001-123456789
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Tipo de Cuenta:
                    </span>
                    <span className="badge-info">Corporativa Premium</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Estado:
                    </span>
                    <span className="badge-success">✓ Activa</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm font-medium text-gray-600">
                      Último Acceso:
                    </span>
                    <span className="text-sm text-gray-700">Hoy, 09:30 AM</span>
                  </div>
                </div>

                {/* Panel de Saldo */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Saldo Disponible
                    </p>
                    <p className="text-3xl font-bold text-blue-700 mb-3">
                      $15,000.50
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <span className="text-green-600 font-medium">
                        ↗ +$500.00
                      </span>
                      <span className="text-gray-500">este mes</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-xs text-gray-600">Línea de Crédito</p>
                      <p className="text-lg font-semibold text-gray-700">
                        $50,000.00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral - Estado ZKP */}
          <div className="lg:col-span-4 space-y-6">
            {/* Estado de Seguridad ZKP */}
            <div className="card-bank-corporate">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-700">🔐</span>
                  </div>
                  Estado de Seguridad
                </h3>
              </div>

              {/* Status Badge Principal */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-semibold text-green-800">
                      Verificado
                    </span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    ZKP VALID
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  Prueba criptográfica validada exitosamente
                </p>
              </div>

              {/* Detalles Técnicos */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protocolo:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.metodo || 'ZK-SNARKs'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo de Prueba:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.metodo?.includes('STARKs') ? "zk-STARKs" : "zk-SNARKs"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Seguridad:</span>
                  <span className="badge-success">Nivel Alto</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trusted Setup:</span>
                  <span className="text-sm text-gray-700">
                    {user?.metodo?.includes('STARKs') ? "No requerido" : "Requerido"}
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas de Sesión */}
            <div className="card-bank-corporate">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Métricas de Sesión
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiempo Activo:</span>
                  <span className="text-sm font-medium text-gray-900">
                    00:15:42
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">IP Address:</span>
                  <span className="text-sm font-mono text-gray-700">
                    192.168.1.100
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dispositivo:</span>
                  <span className="text-sm text-gray-700">
                    Desktop - Chrome
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ubicación:</span>
                  <span className="text-sm text-gray-700">Santa Cruz, BO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Acciones */}
        <div className="mt-8">
          <div className="card-bank-corporate">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Acciones Disponibles
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentView("comparison")}
                className="btn-bank-primary w-full justify-center"
              >
                📊 Comparación de Protocolos ZKP
              </button>
              <button className="btn-bank-secondary w-full justify-center">
                💰 Historial de Transacciones
              </button>
              <button className="btn-bank-secondary w-full justify-center">
                ⚙️ Configuración de Seguridad
              </button>
            </div>
          </div>
        </div>

        {/* Footer de Compliance */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div>
              <p>ZKBank Corporation © 2025 • Todos los derechos reservados</p>
              <p>Certificado ISO 27001 • SOC 2 Type II • GDPR Compliant</p>
            </div>
            <div className="text-right">
              <p>Sesión segura con Zero Knowledge Proof</p>
              <p>ID de Sesión: zkp_session_789abc</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Estado del Sistema */}
      {showSystemStatus && (
        <SystemStatus onClose={() => setShowSystemStatus(false)} />
      )}

      {/* Modal de Probador de Endpoints */}
      {showEndpointTester && (
        <EndpointTester onClose={() => setShowEndpointTester(false)} />
      )}
    </div>
  );
};

export default BankDashboard;
