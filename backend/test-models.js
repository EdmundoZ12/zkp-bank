const Usuario = require("./src/models/Usuario");

async function testModels() {
  try {
    console.log("🧪 Probando modelos...");

    // Buscar usuario existente
    const usuario = await Usuario.findByUsername("juan_perez");
    console.log("👤 Usuario encontrado:", usuario.toSafeObject());

    // Obtener transacciones
    const transacciones = await usuario.getTransacciones(5);
    console.log("💰 Transacciones:", transacciones.length);

    console.log("✅ Modelos funcionando correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testModels();
