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

  // Registro de nuevo usuario
  async register(req, res) {
    try {
      const { 
        username, 
        nombre_completo,
        cedula, 
        fecha_nacimiento, 
        codigo_secreto 
      } = req.body;

      console.log(`🔧 Registrando nuevo usuario: ${username}`);

      // Validar datos requeridos
      if (!username || !nombre_completo || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: ["username", "nombre_completo", "cedula", "fecha_nacimiento", "codigo_secreto"]
        });
      }

      // Verificar que el username no exista
      const usuarioExistente = await Usuario.findByUsername(username);
      if (usuarioExistente) {
        return res.status(409).json({
          error: "El nombre de usuario ya existe",
          message: "Por favor, elija un nombre de usuario diferente"
        });
      }

      // Generar hashes ZKP para almacenamiento
      const hashes = this.generarHashesZKP(cedula, fecha_nacimiento, codigo_secreto);

      // Crear usuario en base de datos
      const nuevoUsuario = await Usuario.create({
        username: username,
        nombre_completo: nombre_completo,
        cedula_hash: hashes.cedula_hash,
        fecha_hash: hashes.fecha_hash,
        codigo_hash: hashes.codigo_hash,
        saldo: 1000.00 // Saldo inicial de bienvenida
      });

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: nuevoUsuario.id, 
          username: nuevoUsuario.username 
        },
        process.env.JWT_SECRET || "zkp_secret_key",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        token: token,
        usuario: nuevoUsuario.toSafeObject(),
        hash_info: {
          cedula_hash_length: hashes.cedula_hash.length,
          fecha_hash_length: hashes.fecha_hash.length,
          codigo_hash_length: hashes.codigo_hash.length
        }
      });

      console.log(`✅ Registro exitoso: ${username}`);
    } catch (error) {
      console.error("❌ Error en registro:", error.message);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "Error al registrar usuario"
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

  // Registro de nuevo usuario
  async register(req, res) {
    try {
      const {
        username,
        nombre_completo,
        cedula,
        fecha_nacimiento,
        codigo_secreto,
      } = req.body;

      console.log(`🔧 Registrando nuevo usuario: ${username}`);

      // Validar datos requeridos
      if (
        !username ||
        !nombre_completo ||
        !cedula ||
        !fecha_nacimiento ||
        !codigo_secreto
      ) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: [
            "username",
            "nombre_completo",
            "cedula",
            "fecha_nacimiento",
            "codigo_secreto",
          ],
        });
      }

      // Verificar que el username no exista
      const usuarioExistente = await Usuario.findByUsername(username);
      if (usuarioExistente) {
        return res.status(409).json({
          error: "El nombre de usuario ya existe",
          message: "Por favor, elija un nombre de usuario diferente",
        });
      }

      // Generar hashes ZKP para almacenamiento
      const hashes = this.generarHashesZKP(cedula, fecha_nacimiento, codigo_secreto);

      // Crear usuario en base de datos
      const nuevoUsuario = await Usuario.create({
        username: username,
        nombre_completo: nombre_completo,
        cedula_hash: hashes.cedula_hash,
        fecha_hash: hashes.fecha_hash,
        codigo_hash: hashes.codigo_hash,
        saldo: 1000.0, // Saldo inicial de bienvenida
      });

      // Generar token JWT
      const token = jwt.sign(
        { id: nuevoUsuario.id, username: nuevoUsuario.username },
        process.env.JWT_SECRET || "zkp_secret_key",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        token: token,
        usuario: nuevoUsuario.toSafeObject(),
        hash_info: {
          cedula_hash_length: hashes.cedula_hash.length,
          fecha_hash_length: hashes.fecha_hash.length,
          codigo_hash_length: hashes.codigo_hash.length,
        },
      });

      console.log(`✅ Registro exitoso: ${username}`);
    } catch (error) {
      console.error("❌ Error en registro:", error.message);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "Error al registrar usuario",
      });
    }
  }

  // Generar hashes ZKP para registro
  generarHashesZKP(cedula, fecha_nacimiento, codigo_secreto) {
    const crypto = require("crypto");

    // Generar hash de cédula
    const cedulaHash = crypto.createHash("sha256").update(cedula).digest();
    const cedula_hash = Array.from(cedulaHash);

    // Generar hash de fecha
    const fechaHash = crypto.createHash("sha256").update(fecha_nacimiento).digest();
    const fecha_hash = Array.from(fechaHash);

    // Generar hash de código
    const codigoHash = crypto.createHash("sha256").update(codigo_secreto).digest();
    const codigo_hash = Array.from(codigoHash);

    return {
      cedula_hash,
      fecha_hash,
      codigo_hash,
    };
  }
}

module.exports = new AuthController();
