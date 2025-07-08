import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { unifiedAPI } from "../../services/api";

const ZKPRegister = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    nombre_completo: "",
    cedula: "",
    fecha_nacimiento: "",
    codigo_secreto: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.nombre_completo ||
      !formData.cedula ||
      !formData.fecha_nacimiento ||
      !formData.codigo_secreto
    ) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔧 Registrando usuario con ZKP...");

      const response = await unifiedAPI.register(formData);

      if (response.success) {
        toast.success("¡Registro exitoso! Bienvenido a ZKP Bank");

        localStorage.setItem("zkp_token", response.token);
        localStorage.setItem("zkp_user", JSON.stringify(response.usuario));

        onRegisterSuccess(response);
      } else {
        toast.error(response.message || "Error en el registro");
      }
    } catch (error) {
      console.error("❌ Error en registro:", error);
      toast.error(error.message || "Error al registrar usuario");
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
      maxWidth: "450px",
      width: "100%",
      overflow: "hidden",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    header: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "25px 20px",
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
      padding: "25px 20px",
    },
    inputGroup: {
      marginBottom: "20px",
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
      padding: "12px 16px",
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
    infoSection: {
      backgroundColor: "#dbeafe",
      border: "2px solid #3b82f6",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "25px",
      display: "flex",
      alignItems: "flex-start",
    },
    infoIcon: {
      fontSize: "20px",
      marginRight: "12px",
      marginTop: "2px",
    },
    infoContent: {
      flex: "1",
    },
    infoTitle: {
      fontWeight: "600",
      fontSize: "14px",
      color: "#1e40af",
      marginBottom: "4px",
    },
    infoText: {
      fontSize: "13px",
      color: "#1e40af",
      lineHeight: "1.4",
    },
    shieldSection: {
      textAlign: "center",
      marginBottom: "25px",
    },
    shield: {
      width: "80px",
      height: "80px",
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
    helpText: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "4px",
      fontStyle: "italic",
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
          <h1 style={styles.title}>Únete a ZKP Bank</h1>
          <p style={styles.subtitle}>
            Crea tu cuenta con autenticación Zero Knowledge
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
            type="email"
            name="fake-email"
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

          {/* Username */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="ej: juan_perez"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="off"
              required
            />
          </div>

          {/* Nombre Completo */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              style={styles.input}
              placeholder="ej: Juan Pérez García"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="off"
              required
            />
          </div>

          {/* Cédula */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Identificación</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              style={styles.input}
              placeholder="ej: 12345678"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="off"
              required
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Fecha de Nacimiento</label>
            <input
              type="text"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              style={styles.input}
              placeholder="YYYYMMDD (ej: 19900515)"
              pattern="[0-9]{8}"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="off"
              required
            />
            <div style={styles.helpText}>Formato: YYYYMMDD (Año-Mes-Día)</div>
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
              placeholder="••••"
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="new-password"
              required
            />
            <div style={styles.helpText}>Código numérico de 4 dígitos</div>
          </div>

          {/* Información de Seguridad */}
          <div style={styles.infoSection}>
            <div style={styles.infoIcon}>🔐</div>
            <div style={styles.infoContent}>
              <div style={styles.infoTitle}>Seguridad Zero Knowledge</div>
              <div style={styles.infoText}>
                Tus datos se protegen usando pruebas criptográficas. Solo tú
                conoces tu información personal.
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
            {loading ? "Creando cuenta..." : "🔐 Crear Cuenta ZKP"}
          </button>

          {/* Footer */}
          <div style={styles.footer}>
            <a
              style={styles.link}
              onClick={onSwitchToLogin}
              onMouseEnter={(e) =>
                (e.target.style.color = styles.linkHover.color)
              }
              onMouseLeave={(e) => (e.target.style.color = styles.link.color)}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZKPRegister;
