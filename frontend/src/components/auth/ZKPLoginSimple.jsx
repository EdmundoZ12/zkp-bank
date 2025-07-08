import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { unifiedAPI } from "../../services/api";

const ZKPLoginSimple = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    cedula: "12345678",
    codigo_secreto: "9876",
    zkp_method: "snarkjs",
  });

  const [loading, setLoading] = useState(false);

  const zkpMethods = [
    { id: "zokrates", name: "ZoKrates", description: "zk-SNARKs con Docker" },
    { id: "snarkjs", name: "snarkjs", description: "zk-SNARKs nativo" },
    { id: "starks", name: "STARKs", description: "zk-STARKs simulado" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cedula || !formData.codigo_secreto) {
      toast.error("Cédula y código de seguridad son requeridos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Iniciando autenticación ZKP...");

      const response = await unifiedAPI.loginSimple(formData);

      if (response.success) {
        toast.success(`¡Login exitoso con ${response.metodo}!`);

        localStorage.setItem("zkp_token", response.token);
        localStorage.setItem("zkp_user", JSON.stringify(response.usuario));

        onLoginSuccess(response);
      } else {
        toast.error(response.message || "Error en el login");
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      toast.error(error.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      maxWidth: "420px",
      width: "100%",
      overflow: "hidden",
    },
    header: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "30px 20px",
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      margin: "0 0 8px 0",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "14px",
      margin: "0",
      opacity: "0.9",
      fontWeight: "400",
    },
    form: {
      padding: "30px 20px",
    },
    inputGroup: {
      marginBottom: "25px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "16px",
      backgroundColor: "white",
      boxSizing: "border-box",
      transition: "all 0.3s ease",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
    protocolSection: {
      marginBottom: "25px",
    },
    protocolGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "8px",
      marginTop: "12px",
    },
    protocolOption: {
      padding: "16px 12px",
      textAlign: "center",
      cursor: "pointer",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      backgroundColor: "white",
      transition: "all 0.3s ease",
      userSelect: "none",
    },
    protocolOptionSelected: {
      borderColor: "#667eea",
      backgroundColor: "#f0f4ff",
      color: "#667eea",
    },
    protocolName: {
      fontWeight: "600",
      fontSize: "14px",
      marginBottom: "4px",
    },
    protocolDesc: {
      fontSize: "11px",
      color: "#6b7280",
      lineHeight: "1.3",
    },
    warningSection: {
      backgroundColor: "#fef3c7",
      border: "2px solid #fbbf24",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "30px",
      display: "flex",
      alignItems: "flex-start",
    },
    warningIcon: {
      fontSize: "20px",
      marginRight: "12px",
      marginTop: "2px",
    },
    warningContent: {
      flex: "1",
    },
    warningTitle: {
      fontWeight: "600",
      fontSize: "14px",
      color: "#92400e",
      marginBottom: "4px",
    },
    warningText: {
      fontSize: "13px",
      color: "#92400e",
      lineHeight: "1.4",
    },
    shieldSection: {
      textAlign: "center",
      marginBottom: "30px",
    },
    shield: {
      width: "100px",
      height: "100px",
      color: "#374151",
      filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
    },
    button: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
      marginBottom: "20px",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.6)",
    },
    buttonDisabled: {
      opacity: "0.6",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
    },
    footer: {
      textAlign: "center",
      paddingBottom: "10px",
    },
    link: {
      color: "#667eea",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
    linkHover: {
      color: "#5a67d8",
    },
    demo: {
      fontSize: "12px",
      color: "#6b7280",
      backgroundColor: "#f9fafb",
      padding: "12px",
      borderRadius: "8px",
      marginTop: "15px",
      border: "1px solid #e5e7eb",
    },
    spinner: {
      display: "inline-block",
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      animation: "spin 1s linear infinite",
      marginRight: "10px",
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Acceso Corporativo</h1>
          <p style={styles.subtitle}>
            Autenticación mediante Zero Knowledge Proof
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          {/* Campos ocultos */}
          <input
            type="text"
            name="fake-username"
            autoComplete="off"
            style={{ display: "none" }}
            tabIndex="-1"
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="off"
            style={{ display: "none" }}
            tabIndex="-1"
          />

          {/* Cédula */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Identificación</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="off"
              required
            />
          </div>

          {/* Código Secreto */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Código de Seguridad</label>
            <input
              type="password"
              name="codigo_secreto"
              value={formData.codigo_secreto}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Protocolo de Verificación */}
          <div style={styles.protocolSection}>
            <label style={styles.label}>Protocolo de Verificación</label>
            <div style={styles.protocolGrid}>
              {zkpMethods.map((method) => (
                <div
                  key={method.id}
                  style={{
                    ...styles.protocolOption,
                    ...(formData.zkp_method === method.id
                      ? styles.protocolOptionSelected
                      : {}),
                  }}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, zkp_method: method.id }))
                  }
                  onMouseEnter={(e) => {
                    if (formData.zkp_method !== method.id) {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.zkp_method !== method.id) {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.backgroundColor = "white";
                    }
                  }}
                >
                  <div style={styles.protocolName}>{method.name}</div>
                  <div style={styles.protocolDesc}>{method.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div style={styles.warningSection}>
            <div style={styles.warningIcon}>🔒</div>
            <div style={styles.warningContent}>
              <div style={styles.warningTitle}>Zero Knowledge Protocol</div>
              <div style={styles.warningText}>
                Tu fecha de nacimiento se mantiene privada. Solo envías cédula y
                código.
              </div>
            </div>
          </div>

          {/* Shield */}
          <div style={styles.shieldSection}>
            <svg style={styles.shield} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              <path
                d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                fill="white"
              />
            </svg>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                Object.assign(e.target.style, styles.buttonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = styles.button.boxShadow;
              }
            }}
          >
            {loading && <div style={styles.spinner}></div>}
            {loading ? "Autenticando..." : "🔐 Autenticar con Zero Knowledge"}
          </button>

          {/* Footer */}
          <div style={styles.footer}>
            <a
              style={styles.link}
              onClick={onSwitchToRegister}
              onMouseEnter={(e) =>
                (e.target.style.color = styles.linkHover.color)
              }
              onMouseLeave={(e) => (e.target.style.color = styles.link.color)}
            >
              ¿No tienes cuenta? Regístrate aquí
            </a>
            <div style={styles.demo}>
              <strong>Demo:</strong> Cédula: 12345678, Código: 9876
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZKPLoginSimple;
