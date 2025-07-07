const express = require("express");
const cuentaController = require("../controllers/cuentaController");
const { verificarToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /cuenta - Información de cuenta
router.get("/", cuentaController.obtenerCuenta);

// GET /cuenta/saldo - Consultar saldo
router.get("/saldo", cuentaController.consultarSaldo);

// GET /cuenta/transacciones - Obtener transacciones
router.get("/transacciones", cuentaController.obtenerTransacciones);

module.exports = router;
