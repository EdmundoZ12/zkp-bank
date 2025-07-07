const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// POST /auth/login - Login con prueba ZKP
router.post("/login", authController.loginZKP);

// POST /auth/verify - Verificar token
router.post("/verify", authController.verificarToken);

// POST /auth/logout - Cerrar sesión
router.post("/logout", authController.logout);

module.exports = router;
