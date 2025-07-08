// frontend/src/components/dashboard/EndpointTester.jsx
import React, { useState } from "react";
import { zkpService } from "../../services/api";

const EndpointTester = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const testData = {
    username: "juan_perez",
    cedula: "12345678",
    fecha_nacimiento: "19900515",
    codigo_secreto: "9876",
  };

  const testEndpoint = async (endpointName, testFunction) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🧪 Probando endpoint: ${endpointName}`);
      const startTime = Date.now();
      
      const result = await testFunction();
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      setResults(prev => ({
        ...prev,
        [endpointName]: {
          success: true,
          result,
          duration,
          timestamp: new Date().toISOString()
        }
      }));

      console.log(`✅ ${endpointName} exitoso:`, result);
    } catch (error) {
      console.error(`❌ Error en ${endpointName}:`, error);
      setResults(prev => ({
        ...prev,
        [endpointName]: {
          success: false,
          error: error.response?.data?.error || error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setResults({});
    setError(null);

    // Probar endpoints secuencialmente
    await testEndpoint('dual-status', () => zkpService.getDualBlockchainStatus());
    await testEndpoint('zokrates-generate', () => zkpService.generateZokratesProof(testData));
    await testEndpoint('snarkjs-generate', () => zkpService.generateSnarkjsProof(testData));
  };

  const clearResults = () => {
    setResults({});
    setError(null);
  };

  const getStatusIcon = (success) => {
    return success ? "✅" : "❌";
  };

  const getStatusColor = (success) => {
    return success ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🧪 Probador de Endpoints
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Controles */}
        <div className="mb-6 flex space-x-3">
          <button
            onClick={testAllEndpoints}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "🔄 Probando..." : "🚀 Probar Todos"}
          </button>
          <button
            onClick={() => testEndpoint('dual-status', () => zkpService.getDualBlockchainStatus())}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            📊 Estado Sistema
          </button>
          <button
            onClick={() => testEndpoint('zokrates-generate', () => zkpService.generateZokratesProof(testData))}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            🔧 ZoKrates
          </button>
          <button
            onClick={() => testEndpoint('snarkjs-generate', () => zkpService.generateSnarkjsProof(testData))}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            ⚡ snarkjs
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🗑️ Limpiar
          </button>
        </div>

        {/* Datos de Prueba */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-semibold mb-3">📋 Datos de Prueba</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Usuario:</span>
              <br />
              <code className="text-blue-600">{testData.username}</code>
            </div>
            <div>
              <span className="font-medium">Cédula:</span>
              <br />
              <code className="text-blue-600">{testData.cedula}</code>
            </div>
            <div>
              <span className="font-medium">Fecha:</span>
              <br />
              <code className="text-blue-600">{testData.fecha_nacimiento}</code>
            </div>
            <div>
              <span className="font-medium">Código:</span>
              <br />
              <code className="text-blue-600">{testData.codigo_secreto}</code>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          {Object.entries(results).map(([endpointName, result]) => (
            <div
              key={endpointName}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-800">
                  {getStatusIcon(result.success)} {endpointName}
                </h4>
                <div className="text-right text-xs text-gray-500">
                  <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
                  {result.duration && (
                    <div className="text-blue-600">{result.duration}ms</div>
                  )}
                </div>
              </div>

              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="text-green-800 font-medium mb-2">✅ Exitoso</div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-green-700 hover:text-green-800">
                      Ver respuesta
                    </summary>
                    <pre className="mt-2 text-xs bg-white border rounded p-2 overflow-auto max-h-40">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-red-800 font-medium mb-2">❌ Error</div>
                  <div className="text-red-700 text-sm">{result.error}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay resultados aún. Haz clic en "Probar Todos" para comenzar.</p>
          </div>
        )}

        {/* Botón Cerrar */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndpointTester;
