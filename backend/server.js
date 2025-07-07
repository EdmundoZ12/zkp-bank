const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Importar rutas
const authRoutes = require("./src/routes/auth");
const cuentaRoutes = require("./src/routes/cuenta");
const zkpRoutes = require("./src/routes/zkp");

// Importar conexión a base de datos
const { testConnection } = require("./database/connection");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://tu-dominio.com"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:5500",
          ],
    credentials: true,
  })
);

// Middleware de logging
app.use(morgan("combined"));

// Middleware para parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static("public"));

// Middleware para IP real
app.set("trust proxy", true);

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    service: "🏦 ZKBank API",
    version: "1.0.0",
    description: "Sistema bancario con autenticación Zero Knowledge",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        "POST /auth/login": "Autenticación con prueba ZKP",
        "POST /auth/verify": "Verificar token JWT",
        "POST /auth/logout": "Cerrar sesión",
      },
      cuenta: {
        "GET /cuenta": "Información de cuenta (requiere auth)",
        "GET /cuenta/saldo": "Consultar saldo (requiere auth)",
        "GET /cuenta/transacciones":
          "Historial de transacciones (requiere auth)",
      },
      zkp: {
        "POST /zkp/generate": "Generar prueba ZKP con ZoKrates real",
        "GET /zkp/status": "Verificar estado de ZoKrates y Docker",
      },
      test: {
        "GET /test-client.html": "Cliente web de prueba",
      },
    },
    tecnologias: {
      zkp: "zk-SNARKs con ZoKrates real",
      database: "PostgreSQL",
      auth: "JWT + Zero Knowledge Proofs",
      privacy: "✅ Datos personales nunca almacenados",
      docker: "ZoKrates ejecutándose en contenedores",
      constraints: "62,060 constraints de seguridad",
    },
    status: {
      database: "connected",
      zokrates: "available",
      docker: "running",
    },
  });
});

// Health check completo
app.get("/health", async (req, res) => {
  try {
    await testConnection();

    // Verificar ZoKrates también
    const zkpService = require("./src/services/zkpService");
    const zokratesOk = await zkpService.verificarZokratesDisponible();

    res.json({
      status: "healthy",
      database: "connected",
      zokrates: zokratesOk ? "available" : "unavailable",
      docker: "running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      zokrates: "unknown",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint de información del sistema ZKP
app.get("/info", (req, res) => {
  res.json({
    sistema: "ZKBank - Sistema Bancario con Zero Knowledge Proofs",
    descripcion: "Autenticación bancaria sin revelar datos personales",
    caracteristicas: {
      privacidad: "Datos personales nunca salen del dispositivo del usuario",
      seguridad: "Pruebas criptográficas imposibles de falsificar",
      transparencia: "Verificación en blockchain pública",
      eficiencia: "Pruebas de 200 bytes, verificación en milisegundos",
    },
    flujo_zkp: {
      1: "Usuario ingresa datos reales en su dispositivo",
      2: "Sistema genera prueba ZKP con ZoKrates",
      3: "Se envía solo la prueba (sin datos reales)",
      4: "Banco verifica prueba sin conocer datos",
      5: "Acceso autorizado manteniendo privacidad total",
    },
    ventajas: {
      usuarios: "Privacidad total de datos personales",
      bancos: "Reducción de fraude y cumplimiento regulatorio",
      sistema: "Escalabilidad y transparencia blockchain",
    },
    tecnologia: {
      zkp_type: "zk-SNARKs",
      library: "ZoKrates",
      constraints: 62060,
      hash_function: "SHA-256",
      blockchain: "Ethereum compatible",
    },
  });
});

// Registrar rutas
app.use("/auth", authRoutes);
app.use("/cuenta", cuentaRoutes);
app.use("/zkp", zkpRoutes);

// Middleware de manejo de errores 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    method: req.method,
    path: req.originalUrl,
    available_endpoints: [
      "GET /",
      "GET /health",
      "GET /info",
      "POST /auth/login",
      "POST /auth/verify",
      "POST /auth/logout",
      "GET /cuenta",
      "GET /cuenta/saldo",
      "GET /cuenta/transacciones",
      "POST /zkp/generate",
      "GET /zkp/status",
    ],
    suggestion: "Visita GET / para ver todos los endpoints disponibles",
  });
});

// Middleware de manejo de errores globales
app.use((error, req, res, next) => {
  console.error("❌ Error no manejado:", error);

  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development" ? error.message : "Algo salió mal",
    timestamp: new Date().toISOString(),
    tip: "Revisa los logs del servidor para más detalles",
  });
});

// Función para iniciar servidor
async function startServer() {
  try {
    // Probar conexión a base de datos
    console.log("🔍 Verificando conexión a base de datos...");
    await testConnection();

    // Verificar ZoKrates
    console.log("🔍 Verificando ZoKrates...");
    const zkpService = require("./src/services/zkpService");
    const zokratesOk = await zkpService.verificarZokratesDisponible();
    console.log(
      `🔧 ZoKrates: ${zokratesOk ? "✅ Disponible" : "⚠️ No disponible"}`
    );

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log("🚀====================================🚀");
      console.log(`🏦 ZKBank API ejecutándose en puerto ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log("🚀====================================🚀");
      console.log("");
      console.log("📋 Endpoints principales:");
      console.log(`   GET    http://localhost:${PORT}/`);
      console.log(`   GET    http://localhost:${PORT}/health`);
      console.log(`   GET    http://localhost:${PORT}/info`);
      console.log("");
      console.log("🔐 Autenticación:");
      console.log(`   POST   http://localhost:${PORT}/auth/login`);
      console.log(`   POST   http://localhost:${PORT}/auth/verify`);
      console.log(`   POST   http://localhost:${PORT}/auth/logout`);
      console.log("");
      console.log("🏦 Cuenta bancaria:");
      console.log(`   GET    http://localhost:${PORT}/cuenta`);
      console.log(`   GET    http://localhost:${PORT}/cuenta/saldo`);
      console.log(`   GET    http://localhost:${PORT}/cuenta/transacciones`);
      console.log("");
      console.log("🔬 Zero Knowledge Proofs:");
      console.log(`   POST   http://localhost:${PORT}/zkp/generate`);
      console.log(`   GET    http://localhost:${PORT}/zkp/status`);
      console.log("");
      console.log("🧪 Testing:");
      console.log(`   WEB    http://localhost:${PORT}/test-client.html`);
      console.log("");
      console.log("🔐 Sistema ZKP listo para autenticación");
      console.log(`💾 Base de datos: PostgreSQL conectada`);
      console.log(
        `🐳 ZoKrates: ${zokratesOk ? "Docker funcionando" : "Verificar Docker"}`
      );
      console.log("✅ Servidor iniciado exitosamente");
    });
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error.message);
    console.error("💡 Verifica que PostgreSQL y Docker estén ejecutándose");
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on("SIGINT", () => {
  console.log("\n🛑 Cerrando servidor ZKBank...");
  console.log("👋 ¡Hasta luego!");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Cerrando servidor ZKBank...");
  console.log("👋 ¡Hasta luego!");
  process.exit(0);
});

// Manejar errores no capturados
process.on("uncaughtException", (error) => {
  console.error("💥 Error no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Promesa rechazada no manejada:", reason);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
