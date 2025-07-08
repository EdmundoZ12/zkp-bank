import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Registro de nuevo usuario
  register: (userData) => api.post('/auth/register', userData),
  // Login con credenciales (solo validación)
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export const zkpService = {
  // ZoKrates
  generateZokratesProof: (data) => api.post('/zkp/generate', data, { timeout: 30000 }),
  getZokratesStatus: () => api.get('/zkp/status'),
  
  // SnarkJS
  generateSnarkjsProof: (data) => api.post('/zkp/snarkjs/generate', data),
  verifySnarkjsProof: (data) => api.post('/zkp/snarkjs/verify', data),
  getSnarkjsStatus: () => api.get('/zkp/snarkjs/status'),
  
  // STARKs
  generateStarksProof: (data) => api.post('/zkp/starks/generate', data),
  verifyStarksProof: (data) => api.post('/zkp/starks/verify', data),
  getStarksStatus: () => api.get('/zkp/starks/status'),
  
  // Comparación
  compareProofSystems: (data) => api.post('/zkp/compare', data),
  
  // Debug
  debugHashes: (data) => api.post('/zkp/debug-hashes', data),
  debugBlockchain: (data) => api.post('/zkp/debug-blockchain', data),
};

export const cuentaService = {
  getBalance: () => api.get('/cuenta/balance'),
  transfer: (transferData) => api.post('/cuenta/transfer', transferData),
  getTransactions: () => api.get('/cuenta/transactions'),
};

export default api;
