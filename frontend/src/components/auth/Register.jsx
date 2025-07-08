import React, { useState } from 'react';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Mail, User, Calendar, Shield } from 'lucide-react';

const Register = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    nombre_completo: '',
    email: '',
    fecha_nacimiento: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.data.success) {
        toast.success('Usuario registrado exitosamente!');
        onRegisterSuccess();
      } else {
        toast.error('Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.response?.data?.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 banking-gradient">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ZKP Banking</h1>
          <p className="text-blue-100">Seguridad bancaria de siguiente generación</p>
        </div>

        {/* Registration Card */}
        <div className="banking-card rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">Únete al futuro de la banca segura</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div className="space-y-2">
              <label htmlFor="usuario" className="flex items-center text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Nombre de Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                className="banking-input w-full px-4 py-3 rounded-xl border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Elige tu nombre de usuario"
                value={formData.usuario}
                onChange={handleInputChange}
              />
            </div>

            {/* Nombre Completo */}
            <div className="space-y-2">
              <label htmlFor="nombre_completo" className="flex items-center text-sm font-semibold text-gray-700">
                <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                Nombre Completo
              </label>
              <input
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                required
                className="banking-input w-full px-4 py-3 rounded-xl border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Tu nombre completo"
                value={formData.nombre_completo}
                onChange={handleInputChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="banking-input w-full px-4 py-3 rounded-xl border-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Fecha de Nacimiento */}
            <div className="space-y-2">
              <label htmlFor="fecha_nacimiento" className="flex items-center text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Fecha de Nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                required
                className="banking-input w-full px-4 py-3 rounded-xl border-0 text-gray-800 focus:outline-none focus:ring-0"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="banking-button w-full py-4 rounded-xl text-white font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Cuenta Bancaria
                </div>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Seguridad Zero-Knowledge</p>
                <p>Tu información está protegida con criptografía avanzada. Nunca almacenamos datos sensibles en texto plano.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
