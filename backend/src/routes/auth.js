const express = require("express");
// Cambia el controlador a la versión nueva y robusta
const authController = require("../controllers/authController_new");

const router = express.Router();

// POST /auth/register - Registro de nuevo usuario
router.post("/register", authController.registrarUsuario);

// POST /auth/login - Login con prueba ZKP
router.post("/login", authController.loginZKP);

// POST /auth/login-simple - Login simplificado (solo cédula y código)
router.post("/login-simple", authController.loginSimplificado);

// POST /auth/verify - Verificar token
router.post("/verify", authController.verificarToken);

// POST /auth/logout - Cerrar sesión
router.post("/logout", authController.logout);

module.exports = router;
