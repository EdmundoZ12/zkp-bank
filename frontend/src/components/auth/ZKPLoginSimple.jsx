import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';

const ZKPLoginSimple = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    cedula: '',
    codigo_secreto: '',
    zkp_method: 'zokrates'
  });
  
  const [loading, setLoading] = useState(false);

  const zkpMethods = [
    { id: 'zokrates', name: 'ZoKrates', description: 'zk-SNARKs con Docker' },
    { id: 'snarkjs', name: 'snarkjs', description: 'zk-SNARKs nativo' },
    { id: 'starks', name: 'STARKs', description: 'zk-STARKs simulado' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cedula || !formData.codigo_secreto) {
      toast.error('Cédula y código de seguridad son requeridos');
      return;
    }

    setLoading(true);

    try {
      const response = await api.loginSimple(formData);
      
      if (response.success) {
        toast.success(`¡Login exitoso con ${response.metodo}!`);
        
        // Guardar token y datos del usuario
        localStorage.setItem('zkp_token', response.token);
        localStorage.setItem('zkp_user', JSON.stringify(response.usuario));
        
        onLoginSuccess(response);
      } else {
        toast.error(response.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Acceso Corporativo</h2>
          <p className="text-gray-600 mt-2">Autenticación mediante Zero Knowledge Proof</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Identificación
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="12345678"
              required
            />
          </div>

          {/* Código Secreto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Seguridad
            </label>
            <input
              type="password"
              name="codigo_secreto"
              value={formData.codigo_secreto}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••"
              required
            />
          </div>

          {/* Protocolo de Verificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Protocolo de Verificación
            </label>
            <div className="grid grid-cols-3 gap-2">
              {zkpMethods.map((method) => (
                <div key={method.id} className="relative">
                  <input
                    type="radio"
                    id={method.id}
                    name="zkp_method"
                    value={method.id}
                    checked={formData.zkp_method === method.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <label
                    htmlFor={method.id}
                    className={`block w-full p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                      formData.zkp_method === method.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{method.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{method.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Información de Zero Knowledge */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium">🔒 Zero Knowledge Protocol</p>
                <p>Tu fecha de nacimiento se mantiene privada. Solo envías cédula y código.</p>
              </div>
            </div>
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
              </div>
            ) : (
              '🔐 Autenticar con Zero Knowledge'
            )}
          </button>

          {/* Link a Registro */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>

          {/* Demo Info */}
          <div className="text-center pt-2">
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Demo:</strong> Cédula: 12345678, Código: 9876
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZKPLoginSimple;
