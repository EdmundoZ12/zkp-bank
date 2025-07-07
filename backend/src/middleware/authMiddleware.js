const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// Middleware para verificar JWT token
async function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token de acceso requerido",
        message: "Incluye 'Authorization: Bearer <token>' en headers",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(decoded.userId);
    if (!usuario) {
      return res.status(401).json({
        error: "Usuario no válido",
      });
    }

    // Agregar información del usuario al request
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.usuario = usuario;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
        message: "Por favor, inicia sesión nuevamente",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    console.error("Error en middleware auth:", error.message);
    res.status(500).json({
      error: "Error verificando autenticación",
    });
  }
}

module.exports = {
  verificarToken,
};
