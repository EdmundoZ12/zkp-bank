const { testConnection, query } = require("./database/connection");

async function testDatabase() {
  console.log("🧪 Probando conexión a base de datos...");

  try {
    // Probar conexión
    await testConnection();

    // Probar consulta
    const result = await query(
      "SELECT COUNT(*) as total_usuarios FROM usuarios"
    );
    console.log("👥 Usuarios en base de datos:", result.rows[0].total_usuarios);

    console.log("✅ Base de datos funcionando correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testDatabase();
