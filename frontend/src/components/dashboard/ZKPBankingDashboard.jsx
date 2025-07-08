import React, { useState, useEffect } from "react";
import { unifiedAPI } from "../../services/api";

const ZKPBankingDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [zkpComparison, setZkpComparison] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [accountData, setAccountData] = useState({
    balance: 15420.75,
    transactions: [
      {
        id: 1,
        type: "deposit",
        amount: 500,
        description: "Salary Deposit",
        date: "2025-01-07",
        time: "14:30",
      },
      {
        id: 2,
        type: "withdrawal",
        amount: -120,
        description: "ATM Withdrawal",
        date: "2025-01-06",
        time: "09:15",
      },
      {
        id: 3,
        type: "transfer",
        amount: -300,
        description: "Transfer to John",
        date: "2025-01-05",
        time: "16:45",
      },
    ],
  });

  // Simular comparación ZKP
  const runZKPComparison = async () => {
    setIsLoadingComparison(true);

    try {
      const response = await unifiedAPI.runZKPComparison({
        username: "juan_perez",
        cedula: "12345678",
        fecha_nacimiento: "19900515",
        codigo_secreto: "9876",
      });

      setZkpComparison(response.resultados || response);
    } catch (error) {
      console.error("Error en comparación ZKP:", error);
      // Fallback con datos mock
      const mockComparison = {
        zokrates: {
          tiempo_generacion_ms: 3247,
          tiempo_verificacion_ms: 150,
          tamano_prueba_bytes: 128,
          valida: true,
          framework: "ZoKrates",
          tipo: "zk-SNARKs",
          trusted_setup: true,
          quantum_resistant: false,
        },
        snarkjs: {
          tiempo_generacion_ms: 1876,
          tiempo_verificacion_ms: 80,
          tamano_prueba_bytes: 256,
          valida: true,
          framework: "snarkjs",
          tipo: "zk-SNARKs",
          trusted_setup: true,
          quantum_resistant: false,
        },
        starks: {
          tiempo_generacion_ms: 4523,
          tiempo_verificacion_ms: 120,
          tamano_prueba_bytes: 24576,
          valida: true,
          framework: "Polygon Miden (simulation)",
          tipo: "zk-STARKs",
          trusted_setup: false,
          quantum_resistant: true,
        },
      };
      setZkpComparison(mockComparison);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return "📈";
      case "withdrawal":
        return "📉";
      case "transfer":
        return "💸";
      default:
        return "💰";
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      backgroundColor: "white",
      borderBottom: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    headerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "70px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    logoIcon: {
      width: "40px",
      height: "40px",
      backgroundColor: "#667eea",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      color: "white",
    },
    logoText: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1a202c",
      margin: 0,
    },
    logoSubtext: {
      fontSize: "12px",
      color: "#64748b",
      margin: 0,
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    userDetails: {
      textAlign: "right",
    },
    username: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#1a202c",
      margin: 0,
    },
    sessionInfo: {
      fontSize: "12px",
      color: "#64748b",
      margin: 0,
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    navigation: {
      backgroundColor: "white",
      borderBottom: "1px solid #e2e8f0",
    },
    navContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
      display: "flex",
      gap: "32px",
    },
    navTab: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "16px 0",
      borderBottom: "2px solid transparent",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#64748b",
      transition: "all 0.2s",
      textDecoration: "none",
    },
    navTabActive: {
      color: "#667eea",
      borderBottomColor: "#667eea",
    },
    main: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "30px 20px",
    },
    balanceCard: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "16px",
      padding: "30px",
      color: "white",
      marginBottom: "30px",
      boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
    },
    balanceHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    balanceAmount: {
      fontSize: "36px",
      fontWeight: "700",
      margin: "10px 0 5px 0",
    },
    balanceLabel: {
      fontSize: "14px",
      opacity: "0.9",
      margin: 0,
    },
    balanceAccount: {
      fontSize: "12px",
      opacity: "0.8",
      margin: 0,
    },
    authBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "10px",
      padding: "12px",
      textAlign: "center",
      backdropFilter: "blur(10px)",
    },
    authBadgeLabel: {
      fontSize: "10px",
      margin: "0 0 4px 0",
      opacity: "0.9",
    },
    authBadgeValue: {
      fontSize: "12px",
      fontWeight: "600",
      margin: 0,
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    statHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#1a202c",
      margin: 0,
    },
    statLabel: {
      fontSize: "14px",
      color: "#64748b",
      margin: 0,
    },
    statIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    cardHeader: {
      padding: "20px",
      borderBottom: "1px solid #e2e8f0",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#1a202c",
      margin: 0,
    },
    cardContent: {
      padding: "20px",
    },
    transactionItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      marginBottom: "12px",
    },
    transactionLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    transactionIcon: {
      fontSize: "20px",
    },
    transactionDetails: {
      display: "flex",
      flexDirection: "column",
    },
    transactionDesc: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#1a202c",
      margin: 0,
    },
    transactionDate: {
      fontSize: "12px",
      color: "#64748b",
      margin: 0,
    },
    transactionAmount: {
      fontSize: "14px",
      fontWeight: "600",
      textAlign: "right",
    },
    positiveAmount: {
      color: "#10b981",
    },
    negativeAmount: {
      color: "#ef4444",
    },
    securityGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    securityStatus: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    statusBadge: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "6px 12px",
      backgroundColor: "#dcfce7",
      color: "#16a34a",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
    },
    statusDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#10b981",
    },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #f1f5f9",
    },
    infoLabel: {
      fontSize: "14px",
      color: "#64748b",
    },
    infoValue: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#1a202c",
    },
    privacyCard: {
      background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)",
      color: "white",
      padding: "20px",
      borderRadius: "12px",
    },
    privacyTitle: {
      fontSize: "16px",
      fontWeight: "600",
      marginBottom: "16px",
    },
    privacyGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
    },
    privacyItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
    },
    checkIcon: {
      color: "#10b981",
      fontSize: "16px",
    },
    comparisonSection: {
      marginBottom: "30px",
    },
    comparisonHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    runButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
    },
    runButtonDisabled: {
      opacity: "0.6",
      cursor: "not-allowed",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    tableHeader: {
      backgroundColor: "#f8fafc",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "600",
      color: "#64748b",
      borderBottom: "1px solid #e2e8f0",
    },
    td: {
      padding: "12px 16px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
    },
    protocolName: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    protocolDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
    },
    securityBadge: {
      padding: "4px 8px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "500",
    },
    highSecurity: {
      backgroundColor: "#dcfce7",
      color: "#16a34a",
    },
    veryHighSecurity: {
      backgroundColor: "#dbeafe",
      color: "#2563eb",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#64748b",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    spinner: {
      display: "inline-block",
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      animation: "spin 1s linear infinite",
    },
  };

  // Agregar CSS para animación
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Componente de Overview
  const OverviewTab = () => (
    <div>
      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div style={styles.balanceHeader}>
          <div>
            <p style={styles.balanceLabel}>Saldo Total</p>
            <p style={styles.balanceAmount}>
              {formatCurrency(accountData.balance)}
            </p>
            <p style={styles.balanceAccount}>Cuenta Principal • ****4789</p>
          </div>
          <div style={styles.authBadge}>
            <p style={styles.authBadgeLabel}>Autenticado con</p>
            <p style={styles.authBadgeValue}>{user?.metodo || "ZK-SNARKs"}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Transacciones Hoy</p>
              <p style={styles.statValue}>3</p>
            </div>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: "#dcfce7",
                color: "#16a34a",
              }}
            >
              💳
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Tiempo de Sesión</p>
              <p style={styles.statValue}>24m</p>
            </div>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: "#dbeafe",
                color: "#2563eb",
              }}
            >
              ⏱️
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div>
              <p style={styles.statLabel}>Seguridad ZKP</p>
              <p style={{ ...styles.statValue, color: "#16a34a" }}>100%</p>
            </div>
            <div
              style={{
                ...styles.statIcon,
                backgroundColor: "#dcfce7",
                color: "#16a34a",
              }}
            >
              🛡️
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Transacciones Recientes</h3>
        </div>
        <div style={styles.cardContent}>
          {accountData.transactions.map((transaction) => (
            <div key={transaction.id} style={styles.transactionItem}>
              <div style={styles.transactionLeft}>
                <span style={styles.transactionIcon}>
                  {getTransactionIcon(transaction.type)}
                </span>
                <div style={styles.transactionDetails}>
                  <p style={styles.transactionDesc}>
                    {transaction.description}
                  </p>
                  <p style={styles.transactionDate}>
                    {transaction.date} • {transaction.time}
                  </p>
                </div>
              </div>
              <div
                style={{
                  ...styles.transactionAmount,
                  ...(transaction.amount > 0
                    ? styles.positiveAmount
                    : styles.negativeAmount),
                }}
              >
                {transaction.amount > 0 ? "+" : ""}
                {formatCurrency(Math.abs(transaction.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente de Seguridad ZKP
  const SecurityTab = () => (
    <div>
      {/* Authentication Status */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.securityStatus}>
            <h3 style={styles.cardTitle}>Estado de Autenticación</h3>
            <div style={styles.statusBadge}>
              <div style={styles.statusDot}></div>
              <span>Verificado</span>
            </div>
          </div>
        </div>

        <div style={styles.cardContent}>
          <div style={styles.securityGrid}>
            <div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Protocolo:</span>
                <span style={styles.infoValue}>
                  {user?.metodo || "ZK-SNARKs"}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Tipo de Prueba:</span>
                <span style={styles.infoValue}>Groth16</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nivel de Seguridad:</span>
                <span style={{ ...styles.infoValue, color: "#16a34a" }}>
                  Muy Alto
                </span>
              </div>
            </div>

            <div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>IP Address:</span>
                <span style={styles.infoValue}>192.168.1.100</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Último Acceso:</span>
                <span style={styles.infoValue}>Hoy, 09:30</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Dispositivo:</span>
                <span style={styles.infoValue}>Desktop Chrome</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Features */}
      <div style={{ marginTop: "20px" }}>
        <div style={styles.privacyCard}>
          <h3 style={styles.privacyTitle}>Características de Privacidad</h3>
          <div style={styles.privacyGrid}>
            <div style={styles.privacyItem}>
              <span style={styles.checkIcon}>✅</span>
              <span>Datos personales nunca enviados</span>
            </div>
            <div style={styles.privacyItem}>
              <span style={styles.checkIcon}>✅</span>
              <span>Verificación criptográfica</span>
            </div>
            <div style={styles.privacyItem}>
              <span style={styles.checkIcon}>✅</span>
              <span>Protección contra replay attacks</span>
            </div>
            <div style={styles.privacyItem}>
              <span style={styles.checkIcon}>✅</span>
              <span>Verificación en blockchain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Componente de Comparación ZKP
  const ComparisonTab = () => (
    <div style={styles.comparisonSection}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.comparisonHeader}>
            <h3 style={styles.cardTitle}>Comparación de Protocolos ZKP</h3>
            <button
              onClick={runZKPComparison}
              disabled={isLoadingComparison}
              style={{
                ...styles.runButton,
                ...(isLoadingComparison ? styles.runButtonDisabled : {}),
              }}
            >
              {isLoadingComparison && <div style={styles.spinner}></div>}
              <span>📊</span>
              <span>
                {isLoadingComparison ? "Ejecutando..." : "Ejecutar Comparación"}
              </span>
            </button>
          </div>
        </div>

        <div style={styles.cardContent}>
          {zkpComparison ? (
            <div>
              {/* Performance Comparison */}
              <h4
                style={{
                  ...styles.cardTitle,
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              >
                Comparación de Rendimiento
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>Protocolo</th>
                      <th style={styles.th}>Tiempo (ms)</th>
                      <th style={styles.th}>Tamaño Prueba</th>
                      <th style={styles.th}>Gas Usado</th>
                      <th style={styles.th}>Seguridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(zkpComparison).map(([protocol, data]) => (
                      <tr key={protocol}>
                        <td style={styles.td}>
                          <div style={styles.protocolName}>
                            <div
                              style={{
                                ...styles.protocolDot,
                                backgroundColor:
                                  protocol === "zokrates"
                                    ? "#10b981"
                                    : protocol === "snarkjs"
                                    ? "#3b82f6"
                                    : "#a855f7",
                              }}
                            ></div>
                            <span
                              style={{
                                fontWeight: "500",
                                textTransform: "capitalize",
                              }}
                            >
                              {protocol}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {data.tiempo_generacion_ms?.toLocaleString() || "N/A"}
                          ms
                        </td>
                        <td style={styles.td}>
                          {data.tamano_prueba_bytes > 1000
                            ? `${(data.tamano_prueba_bytes / 1024).toFixed(
                                1
                              )}KB`
                            : `${data.tamano_prueba_bytes}B`}
                        </td>
                        <td style={styles.td}>
                          {data.gasUsed > 0
                            ? data.gasUsed?.toLocaleString()
                            : "N/A"}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.securityBadge,
                              ...(data.security === "Very High"
                                ? styles.veryHighSecurity
                                : styles.highSecurity),
                            }}
                          >
                            {data.security}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📊</div>
              <p>Ejecuta una comparación para ver los resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Logo y título */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🛡️</div>
            <div>
              <h1 style={styles.logoText}>ZKP Banking</h1>
              <p style={styles.logoSubtext}>Sistema Bancario Zero Knowledge</p>
            </div>
          </div>

          {/* Usuario y logout */}
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <p style={styles.username}>
                {user?.usuario?.username || user?.username || "Usuario"}
              </p>
              <p style={styles.sessionInfo}>Sesión ZKP Activa</p>
            </div>
            <button
              onClick={onLogout}
              style={styles.logoutBtn}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#fecaca")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#fee2e2")}
            >
              <span>🚪</span>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={styles.navigation}>
        <div style={styles.navContent}>
          <a
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.navTab,
              ...(activeTab === "overview" ? styles.navTabActive : {}),
            }}
          >
            <span>💰</span>
            <span>Resumen</span>
          </a>

          <a
            onClick={() => setActiveTab("security")}
            style={{
              ...styles.navTab,
              ...(activeTab === "security" ? styles.navTabActive : {}),
            }}
          >
            <span>🛡️</span>
            <span>Seguridad ZKP</span>
          </a>

          <a
            onClick={() => setActiveTab("comparison")}
            style={{
              ...styles.navTab,
              ...(activeTab === "comparison" ? styles.navTabActive : {}),
            }}
          >
            <span>📊</span>
            <span>Comparación ZKP</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "comparison" && <ComparisonTab />}
      </main>
    </div>
  );
};

export default ZKPBankingDashboard;
