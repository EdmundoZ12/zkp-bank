const Usuario = require("../models/Usuario");
const zkpService = require("../services/zkpService");
const jwt = require("jsonwebtoken");
const { query } = require("../../database/connection");

class AuthController {
  // Login con prueba ZKP
  async loginZKP(req, res) {
    try {
      const { username, proof, publicSignals } = req.body;

      console.log(`🔐 Intento de login ZKP: ${username}`);

      // Validar datos requeridos
      if (!username || !proof || !publicSignals) {
        return res.status(400).json({
          error: "Datos requeridos: username, proof, publicSignals",
        });
      }

      // Buscar usuario en base de datos
      const usuario = await Usuario.findByUsername(username);
      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      }

      // Preparar hashes esperados
      const expectedHashes = {
        cedula_hash: usuario.cedula_hash,
        fecha_hash: usuario.fecha_hash,
        codigo_hash: usuario.codigo_hash,
      };

      // Verificar prueba ZKP
      const pruebaValida = await zkpService.verificarPrueba(
        proof,
        publicSignals,
        expectedHashes
      );

      if (!pruebaValida) {
        return res.status(401).json({
          error: "Credenciales incorrectas",
          message: "La prueba ZKP no es válida",
        });
      }

      // Verificar replay attack
      const proofHash = zkpService.generarHashPrueba(proof);
      const noEsReplay = await zkpService.verificarReplayAttack(proofHash);

      if (!noEsReplay) {
        return res.status(401).json({
          error: "Prueba ya utilizada",
          message: "Esta prueba ZKP ya fue usada anteriormente",
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: usuario.id,
          username: usuario.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Registrar sesión en base de datos
      await query(
        `INSERT INTO sesiones_zkp (usuario_id, proof_hash, ip_address, user_agent, verificado, token_jwt)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          usuario.id,
          proofHash,
          req.ip || req.connection.remoteAddress,
          req.get("User-Agent"),
          true,
          token,
        ]
      );

      // Actualizar último acceso
      await usuario.updateLastAccess();

      // Respuesta exitosa
      res.json({
        success: true,
        message: "Autenticación ZKP exitosa",
        token: token,
        usuario: usuario.toSafeObject(),
        metodo: "zk-SNARKs (ZoKrates)",
        privacidad: "✅ Datos personales protegidos",
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Login exitoso: ${username}`);
    } catch (error) {
      console.error("❌ Error en login ZKP:", error.message);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "Error al procesar autenticación ZKP",
      });
    }
  }

  // Verificar token JWT
  async verificarToken(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          error: "Token requerido",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.findById(decoded.userId);

      if (!usuario) {
        return res.status(401).json({
          error: "Usuario no válido",
        });
      }

      res.json({
        valid: true,
        usuario: usuario.toSafeObject(),
        expiresIn: decoded.exp,
      });
    } catch (error) {
      res.status(401).json({
        error: "Token inválido",
        message: error.message,
      });
    }
  }

  // Logout (invalidar sesión)
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (token) {
        // Marcar sesión como expirada
        await query(
          "UPDATE sesiones_zkp SET expira_en = NOW() WHERE token_jwt = $1",
          [token]
        );
      }

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      res.status(500).json({
        error: "Error cerrando sesión",
      });
    }
  }
}

module.exports = new AuthController();
