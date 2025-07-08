import React, { useState, useEffect } from 'react';
import { cuentaService, authService } from '../../services/api';
import { LogOut, CreditCard, Send, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transferData, setTransferData] = useState({
    destinatario: '',
    cantidad: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        cuentaService.getBalance(),
        cuentaService.getTransactions(),
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data.balance);
      }

      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.transactions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar datos del usuario');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await cuentaService.transfer(transferData);
      
      if (response.data.success) {
        toast.success('Transferencia realizada exitosamente!');
        setTransferData({ destinatario: '', cantidad: '' });
        loadUserData(); // Reload balance and transactions
      } else {
        toast.error('Error en la transferencia');
      }
    } catch (error) {
      console.error('Error en transferencia:', error);
      toast.error(error.response?.data?.message || 'Error en la transferencia');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZKP Banking</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user?.nombre_completo || user?.usuario}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('balance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'balance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Balance
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transfer'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Send className="h-4 w-4 inline mr-2" />
                Transferir
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Historial
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'balance' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Balance de Cuenta</h3>
                <div className="mt-5">
                  <div className="text-3xl font-bold text-green-600">
                    ${balance.toLocaleString()}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Saldo disponible
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Realizar Transferencia</h3>
                <form onSubmit={handleTransfer} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">
                      Usuario Destinatario
                    </label>
                    <input
                      type="text"
                      id="destinatario"
                      name="destinatario"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ingresa el usuario destinatario"
                      value={transferData.destinatario}
                      onChange={(e) => setTransferData({...transferData, destinatario: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      id="cantidad"
                      name="cantidad"
                      min="1"
                      max={balance}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Ingresa la cantidad a transferir"
                      value={transferData.cantidad}
                      onChange={(e) => setTransferData({...transferData, cantidad: e.target.value})}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Procesando...' : 'Transferir'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Historial de Transacciones</h3>
                <div className="mt-5">
                  {transactions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay transacciones registradas</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {transaction.tipo === 'enviado' ? 'Enviado a' : 'Recibido de'} {transaction.destinatario || transaction.remitente}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(transaction.fecha).toLocaleDateString()}
                                </p>
                              </div>
                              <div className={`text-sm font-medium ${
                                transaction.tipo === 'enviado' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {transaction.tipo === 'enviado' ? '-' : '+'}${transaction.cantidad.toLocaleString()}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
