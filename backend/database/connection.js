const { Pool } = require("pg");
require("dotenv").config();

// Configuración de conexión PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "db_zkpbank",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexión idle
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
});

// Evento de conexión exitosa
pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL - db_zkpbank");
});

// Evento de error
pool.on("error", (err) => {
  console.error("❌ Error en conexión PostgreSQL:", err.message);
  process.exit(-1);
});

// Función para probar conexión
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("🕐 Conexión DB exitosa:", result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error("❌ Error probando conexión:", err.message);
    return false;
  }
}

// Función para ejecutar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query ejecutado en ${duration}ms`);
    return result;
  } catch (err) {
    console.error("❌ Error en query:", err.message);
    throw err;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
};
