const Usuario = require("../models/Usuario");

class CuentaController {
  // Obtener información de cuenta
  async obtenerCuenta(req, res) {
    try {
      const usuario = await Usuario.findById(req.userId);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      res.json({
        cuenta: {
          usuario: usuario.username,
          numero_cuenta: usuario.numero_cuenta,
          saldo: usuario.saldo,
          estado: usuario.estado,
          ultimo_acceso: usuario.ultimo_acceso,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error obteniendo cuenta:", error.message);
      res.status(500).json({
        error: "Error obteniendo información de cuenta",
      });
    }
  }

  // Obtener transacciones
  async obtenerTransacciones(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const usuario = await Usuario.findById(req.userId);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      const transacciones = await usuario.getTransacciones(limit);

      res.json({
        transacciones: transacciones,
        total: transacciones.length,
        usuario: usuario.username,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error obteniendo transacciones:", error.message);
      res.status(500).json({
        error: "Error obteniendo transacciones",
      });
    }
  }

  // Consultar saldo
  async consultarSaldo(req, res) {
    try {
      const usuario = await Usuario.findById(req.userId);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      res.json({
        saldo: usuario.saldo,
        numero_cuenta: usuario.numero_cuenta,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error consultando saldo:", error.message);
      res.status(500).json({
        error: "Error consultando saldo",
      });
    }
  }
}

module.exports = new CuentaController();
