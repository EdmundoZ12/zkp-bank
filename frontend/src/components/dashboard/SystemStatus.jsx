// frontend/src/components/dashboard/SystemStatus.jsx
import React, { useState, useEffect } from "react";
import { zkpService } from "../../services/api";

const SystemStatus = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Verificando estado del sistema...");
      
      const dualStatus = await zkpService.getDualBlockchainStatus();
      console.log("✅ Estado dual blockchain:", dualStatus);

      setStatusData(dualStatus);
    } catch (error) {
      console.error("❌ Error verificando estado:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Error verificando estado del sistema"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (available) => {
    return available ? "✅" : "❌";
  };

  const getStatusColor = (available) => {
    return available ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🔧 Estado del Sistema
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Verificando estado del sistema...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">❌ Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={checkSystemStatus}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔄 Reintentar
            </button>
          </div>
        )}

        {statusData && (
          <div className="space-y-6">
            {/* Estado General */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold mb-3">
                📊 Estado General del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {new Date(statusData.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Estado:</span>
                  <br />
                  <span className={`font-bold ${getStatusColor(statusData.success)}`}>
                    {statusData.success ? "🟢 Operativo" : "🔴 Con Problemas"}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado Dual Blockchain */}
            {statusData.dual_blockchain && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-gray-800 font-semibold mb-3">
                  🔗 Servicio Dual Blockchain
                </h3>
                
                <div className="mb-4">
                  <span className="font-medium">Disponibilidad:</span>
                  <span className={`ml-2 font-bold ${getStatusColor(statusData.dual_blockchain.disponible)}`}>
                    {getStatusIcon(statusData.dual_blockchain.disponible)} 
                    {statusData.dual_blockchain.disponible ? "Disponible" : "No Disponible"}
                  </span>
                </div>

                {statusData.dual_blockchain.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <span className="text-red-800 font-medium">Error:</span>
                    <p className="text-red-700 text-sm mt-1">
                      {statusData.dual_blockchain.error}
                    </p>
                  </div>
                )}

                {statusData.dual_blockchain.disponible && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contrato ZoKrates */}
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h4 className="font-medium text-gray-800 mb-2">
                        🔧 Contrato ZoKrates
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Dirección:</span>
                          <br />
                          <code className="text-xs bg-gray-100 px-1 rounded">
                            {statusData.dual_blockchain.zokrates_address}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Bytecode:</span>
                          <span className="ml-1 text-green-600">
                            {statusData.dual_blockchain.zokrates_bytecode_length} bytes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contrato snarkjs */}
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <h4 className="font-medium text-gray-800 mb-2">
                        ⚡ Contrato snarkjs
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium">Dirección:</span>
                          <br />
                          <code className="text-xs bg-gray-100 px-1 rounded">
                            {statusData.dual_blockchain.snarkjs_address}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Bytecode:</span>
                          <span className="ml-1 text-green-600">
                            {statusData.dual_blockchain.snarkjs_bytecode_length} bytes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botones de Acción */}
            <div className="flex space-x-3">
              <button
                onClick={checkSystemStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                🔄 Actualizar Estado
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatus;
