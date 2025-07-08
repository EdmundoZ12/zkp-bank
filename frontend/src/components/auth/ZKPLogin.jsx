import React, { useState } from 'react';
import { zkpService, authService } from '../../services/api';
import toast from 'react-hot-toast';

const ZKPLogin = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('method'); // 'method' | 'credentials' | 'proof'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [credentials, setCredentials] = useState({
    username: '',
    cedula: '',
    fecha_nacimiento: '',
    codigo_secreto: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const zkpMethods = [
    {
      id: 'zokrates',
      name: 'ZoKratesss',
      description: 'Pruebas ZK-SNARKs con ZoKrates',
      badge: 'Seguro',
      badgeClass: 'zkp-badge zkp-badge-secure',
      icon: '🔐'
    },
    {
      id: 'snarkjs',
      name: 'SnarkJS',
      description: 'Pruebas ZK-SNARKs con SnarkJS',
      badge: 'Rápido',
      badgeClass: 'zkp-badge zkp-badge-fast',
      icon: '⚡'
    },
    {
      id: 'starks',
      name: 'zk-STARKs',
      description: 'Pruebas quantum-resistant',
      badge: 'Quantum-Safe',
      badgeClass: 'zkp-badge zkp-badge-quantum',
      icon: '🛡️'
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep('credentials');
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('proof');

    try {
      let response;
      
      switch (selectedMethod.id) {
        case 'zokrates':
          response = await zkpService.generateZokratesProof(credentials);
          break;
        case 'snarkjs':
          response = await zkpService.generateSnarkjsProof(credentials);
          break;
        case 'starks':
          response = await zkpService.generateStarksProof(credentials);
          break;
        default:
          throw new Error('Método ZKP no válido');
      }

      if (response.data.success) {
        toast.success(`Autenticación ${selectedMethod.name} exitosa!`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
      } else {
        throw new Error(response.data.error || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('Error en ZKP:', error);
      toast.error(error.response?.data?.error || error.message || 'Error en la autenticación ZKP');
      setStep('credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStep('proof');

    try {
      // Primero registrar el usuario
      const registerResponse = await authService.register(credentials);
      
      if (registerResponse.data.success) {
        toast.success('Usuario registrado exitosamente!');
        
        // Luego autenticar con ZKP
        let zkpResponse;
        
        switch (selectedMethod.id) {
          case 'zokrates':
            zkpResponse = await zkpService.generateZokratesProof(credentials);
            break;
          case 'snarkjs':
            zkpResponse = await zkpService.generateSnarkjsProof(credentials);
            break;
          case 'starks':
            zkpResponse = await zkpService.generateStarksProof(credentials);
            break;
          default:
            throw new Error('Método ZKP no válido');
        }

        if (zkpResponse.data.success) {
          toast.success(`Registro y autenticación ${selectedMethod.name} exitosa!`);
          localStorage.setItem('token', zkpResponse.data.token);
          localStorage.setItem('user', JSON.stringify(zkpResponse.data.user));
          onLoginSuccess(zkpResponse.data.user);
        } else {
          throw new Error(zkpResponse.data.error || 'Error en la autenticación ZKP');
        }
      } else {
        throw new Error(registerResponse.data.error || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro/ZKP:', error);
      toast.error(error.response?.data?.error || error.message || 'Error en el registro');
      setStep('credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      {/* Toggle Login/Register */}
      <div className="text-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>

      <div className="text-center">
        <div className="zkp-logo">
          <span className="text-white font-bold text-3xl">ZB</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ZKP Banking</h1>
        <p className="text-gray-600">
          {mode === 'login' 
            ? 'Selecciona tu método de autenticación ZKP' 
            : 'Registrate y selecciona tu método de autenticación ZKP'
          }
        </p>
      </div>

      <div className="space-y-4">
        {zkpMethods.map((method) => (
          <div
            key={method.id}
            className="zkp-method-card"
            onClick={() => handleMethodSelect(method)}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                method.id === 'zokrates' ? 'gradient-green' :
                method.id === 'snarkjs' ? 'gradient-blue' : 'gradient-purple'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                  <span className={method.badgeClass}>{method.badge}</span>
                </div>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4 ${
          selectedMethod.id === 'zokrates' ? 'gradient-green' :
          selectedMethod.id === 'snarkjs' ? 'gradient-blue' : 'gradient-purple'
        }`}>
          {selectedMethod.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMethod.name}</h2>
        <p className="text-gray-600 text-sm">{selectedMethod.description}</p>
      </div>

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-900 font-medium mb-2">Usuario</label>
          <input
            type="text"
            name="username"
            required
            className="zkp-input"
            placeholder="Tu nombre de usuario"
            value={credentials.username}
            onChange={handleInputChange}
          />
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-gray-900 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              className="zkp-input"
              placeholder="tu@email.com"
              value={credentials.email}
              onChange={handleInputChange}
            />
          </div>
        )}

        <div>
          <label className="block text-gray-900 font-medium mb-2">Cédula</label>
          <input
            type="text"
            name="cedula"
            required
            className="zkp-input"
            placeholder="Tu número de cédula"
            value={credentials.cedula}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-900 font-medium mb-2">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            required
            className="zkp-input"
            value={credentials.fecha_nacimiento}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-gray-900 font-medium mb-2">Código Secreto</label>
          <input
            type="password"
            name="codigo_secreto"
            required
            className="zkp-input"
            placeholder="Tu código secreto"
            value={credentials.codigo_secreto}
            onChange={handleInputChange}
          />
        </div>

        <div className="pt-4 space-y-3">
          <button type="submit" className="zkp-button" disabled={isLoading}>
            {mode === 'login' 
              ? `Generar Prueba ${selectedMethod.name}` 
              : `Registrar y Autenticar con ${selectedMethod.name}`
            }
          </button>
          <button
            type="button"
            onClick={() => setStep('method')}
            className="zkp-button-secondary"
          >
            Cambiar Método
          </button>
        </div>
      </form>
    </div>
  );

  const renderProofGeneration = () => (
    <div className="text-center space-y-6">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto ${
        selectedMethod.id === 'zokrates' ? 'gradient-green' :
        selectedMethod.id === 'snarkjs' ? 'gradient-blue' : 'gradient-purple'
      }`}>
        {selectedMethod.icon}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' 
            ? `Generando Prueba ${selectedMethod.name}` 
            : `Registrando y Generando Prueba ${selectedMethod.name}`
          }
        </h2>
        <p className="text-gray-600 mb-4">
          {mode === 'login' 
            ? 'Creando prueba criptográfica...' 
            : 'Registrando usuario y creando prueba criptográfica...'
          }
        </p>
        
        <div className="loading-spinner"></div>
        
        <p className="text-gray-500 text-sm mt-4">Este proceso puede tomar unos momentos...</p>
      </div>
    </div>
  );

  return (
    <div className="zkp-container">
      <div className="zkp-card">
        {step === 'method' && renderMethodSelection()}
        {step === 'credentials' && renderCredentialsForm()}
        {step === 'proof' && renderProofGeneration()}
      </div>
    </div>
  );
};

export default ZKPLogin;
