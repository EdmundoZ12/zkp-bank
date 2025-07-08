const Usuario = require("../models/Usuario");
const zkpService = require("../services/zkpService");
const jwt = require("jsonwebtoken");
const { query } = require("../../database/connection");

class AuthController {
  // Login con prueba ZKP (original)
  async loginZKP(req, res) {
    try {
      const { username, proof, publicSignals } = req.body;

      console.log(`🔐 Intentando login ZKP para: ${username}`);
      console.log('📊 Debug - Datos recibidos:');
      console.log('- Username:', username);
      console.log('- Proof keys:', proof ? Object.keys(proof) : 'null');
      console.log('- PublicSignals length:', publicSignals ? publicSignals.length : 'null');

      if (!username || !proof) {
        return res.status(400).json({
          error: "Datos requeridos",
          message: "Se requiere username y proof"
        });
      }

      // Extraer publicSignals correctamente de diferentes formatos
      let actualPublicSignals = publicSignals;

      if (!actualPublicSignals && proof.publicSignals) {
        actualPublicSignals = proof.publicSignals;
        console.log('📋 Usando publicSignals del objeto proof');
      } else if (!actualPublicSignals && proof.inputs) {
        actualPublicSignals = proof.inputs;
        console.log('📋 Usando inputs del objeto proof');
      }

      if (!actualPublicSignals) {
        return res.status(400).json({
          error: "No se encontraron publicSignals en la solicitud",
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
        actualPublicSignals,
        expectedHashes
      );

      if (!pruebaValida) {
        return res.status(401).json({
          error: "Credenciales incorrectas",
          message: "La prueba ZKP no es válida",
        });
      }

      // Detectar tipo de prueba para la respuesta
      const proofType = zkpService.detectarTipoPrueba(proof);
      let metodoAutenticacion = "zk-SNARKs (ZoKrates)"; // fallback
      
      if (proofType === 'snarkjs') {
        metodoAutenticacion = "zk-SNARKs (snarkjs)";
      } else if (proofType === 'zokrates') {
        metodoAutenticacion = "zk-SNARKs (ZoKrates)";
      } else if (proofType === 'starks') {
        metodoAutenticacion = "zk-STARKs";
      }

      // Verificar replay attack
      const proofHash = zkpService.generarHashPrueba(proof);
      const hashString = typeof proofHash === 'string' ? proofHash : String(proofHash);
      console.log(`🔍 Verificando replay attack - Hash: ${hashString.substring(0, 16)}...`);
      
      const noEsReplay = await zkpService.verificarReplayAttack(hashString);
      console.log(`🔍 Resultado replay attack: ${noEsReplay}`);

      if (!noEsReplay) {
        return res.status(409).json({
          error: "Prueba ya utilizada",
          message: "Esta prueba ZKP ya ha sido utilizada anteriormente"
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        process.env.JWT_SECRET || "zkp_secret_key",
        { expiresIn: "24h" }
      );

      // Guardar sesión en base de datos
      try {
        await query(
          `INSERT INTO sesiones_zkp (usuario_id, proof_hash, ip_address, user_agent, verificado, token_jwt)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            usuario.id,
            hashString,
            req.ip || req.connection.remoteAddress,
            req.get("User-Agent"),
            true,
            token,
          ]
        );
      } catch (dbError) {
        if (dbError.code === '23505') { // Duplicate key error
          console.log(`⚠️ Hash duplicado detectado, actualizando registro existente`);
          await query(
            `UPDATE sesiones_zkp SET 
               usuario_id = $1, 
               ip_address = $2, 
               user_agent = $3, 
               verificado = $4, 
               token_jwt = $5,
               fecha_creacion = NOW()
             WHERE proof_hash = $6`,
            [
              usuario.id,
              req.ip || req.connection.remoteAddress,
              req.get("User-Agent"),
              true,
              token,
              hashString
            ]
          );
        } else {
          throw dbError; // Re-lanzar si no es error de duplicado
        }
      }

      // Actualizar último acceso
      await usuario.updateLastAccess();

      // Respuesta exitosa
      res.json({
        success: true,
        message: "Autenticación ZKP exitosa",
        token: token,
        usuario: usuario.toSafeObject(),
        metodo: metodoAutenticacion,
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
  async registrarUsuario(req, res) {
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
        bienvenida: {
          saldo_inicial: "1000.00",
          mensaje: "¡Bienvenido a ZKP Bank! Tu cuenta ha sido creada con un bono de bienvenida."
        },
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Usuario registrado exitosamente: ${username}`);

    } catch (error) {
      console.error("❌ Error en registro:", error.message);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "Error al registrar usuario"
      });
    }
  }

  // Login simplificado (Opción B) - Solo cédula y código
  async loginSimplificado(req, res) {
    try {
      const { cedula, codigo_secreto, zkp_method } = req.body;

      console.log(`🔐 Login simplificado para cédula: ${cedula} (método: ${zkp_method || 'zokrates'})`);

      // Validar datos requeridos
      if (!cedula || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: ["cedula", "codigo_secreto"]
        });
      }

      // Buscar usuario por cédula
      const usuario = await Usuario.findByCedula(cedula);
      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado",
          message: "La cédula no está registrada en el sistema"
        });
      }

      // Obtener fecha de nacimiento de la base de datos (privada)
      const fecha_nacimiento = await this.obtenerFechaNacimientoPrivada(usuario.id);

      // Preparar hashes esperados
      const expectedHashes = {
        cedula_hash: usuario.cedula_hash,
        fecha_hash: usuario.fecha_hash,
        codigo_hash: usuario.codigo_hash,
      };

      // Generar prueba ZKP con el método seleccionado
      let proof, publicSignals, metodoAutenticacion;

      if (zkp_method === 'snarkjs') {
        const snarkjsService = require('../services/snarkjsService');
        const result = await snarkjsService.generarPrueba(
          cedula,
          fecha_nacimiento,
          codigo_secreto,
          expectedHashes
        );
        proof = result.proof;
        publicSignals = result.publicSignals;
        metodoAutenticacion = "zk-SNARKs (snarkjs)";
      } else if (zkp_method === 'starks') {
        const starksService = require('../services/starksService');
        const result = await starksService.generarPrueba(
          cedula,
          fecha_nacimiento,
          codigo_secreto,
          expectedHashes
        );
        proof = result;
        publicSignals = result.public_inputs || [];
        metodoAutenticacion = "zk-STARKs";
      } else {
        // ZoKrates por defecto
        proof = await zkpService.generarPrueba(
          cedula,
          fecha_nacimiento,
          codigo_secreto,
          expectedHashes
        );
        publicSignals = [
          ...usuario.cedula_hash,
          ...usuario.fecha_hash,
          ...usuario.codigo_hash,
        ];
        metodoAutenticacion = "zk-SNARKs (ZoKrates)";
      }

      // Verificar prueba ZKP
      const pruebaValida = await zkpService.verificarPrueba(
        proof,
        publicSignals,
        expectedHashes
      );

      if (!pruebaValida) {
        return res.status(401).json({
          error: "Credenciales incorrectas",
          message: "Los datos ingresados no son válidos"
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          username: usuario.username 
        },
        process.env.JWT_SECRET || "zkp_secret_key",
        { expiresIn: "24h" }
      );

      // Guardar sesión (protección replay attack)
      const proofHash = zkpService.generarHashPrueba(proof);
      await this.guardarSesionZKP(usuario, proofHash, token, req);

      // Actualizar último acceso
      await usuario.updateLastAccess();

      res.json({
        success: true,
        message: "Autenticación ZKP exitosa",
        token: token,
        usuario: usuario.toSafeObject(),
        metodo: metodoAutenticacion,
        privacidad: "✅ Solo cédula y código enviados - Fecha privada",
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Login simplificado exitoso: ${usuario.username}`);

    } catch (error) {
      console.error("❌ Error en login simplificado:", error.message);
      res.status(500).json({
        error: "Error interno del servidor",
        message: "Error al procesar autenticación"
      });
    }
  }

  // Generar prueba snarkjs
  async generarPruebaSnarkjs(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`🔧 Generando prueba snarkjs para: ${username}`);

      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: ["username", "cedula", "fecha_nacimiento", "codigo_secreto"]
        });
      }

      const usuario = await Usuario.findByUsername(username);
      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado"
        });
      }

      const expectedHashes = {
        cedula_hash: usuario.cedula_hash,
        fecha_hash: usuario.fecha_hash,
        codigo_hash: usuario.codigo_hash,
        cedula: "12345678",
        fecha: "19900515",
        codigo: "9876"
      };

      const snarkjsService = require('../services/snarkjsService');
      const result = await snarkjsService.generarPrueba(
        cedula,
        fecha_nacimiento,
        codigo_secreto,
        expectedHashes
      );

      res.json({
        success: true,
        proof: result.proof,
        publicSignals: result.publicSignals,
        metadata: {
          username: username,
          timestamp: new Date().toISOString(),
          metodo: "snarkjs",
          processing_time_ms: result.processing_time_ms,
          constraints: result.circuit_info.constraints,
        },
        message: "Prueba snarkjs generada exitosamente"
      });

    } catch (error) {
      console.error('❌ Error generando prueba snarkjs:', error.message);
      res.status(500).json({
        error: "Error generando prueba ZKP",
        message: error.message,
      });
    }
  }

  // Verificar token JWT
  async verificarToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          error: "Token no proporcionado"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "zkp_secret_key");
      const usuario = await Usuario.findById(decoded.id);

      if (!usuario) {
        return res.status(404).json({
          error: "Usuario no encontrado"
        });
      }

      res.json({
        success: true,
        usuario: usuario.toSafeObject()
      });

    } catch (error) {
      res.status(401).json({
        error: "Token inválido"
      });
    }
  }

  // Cerrar sesión
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        await query(
          "UPDATE sesiones_zkp SET verificado = false WHERE token_jwt = $1",
          [token]
        );
      }

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente"
      });

    } catch (error) {
      console.error('❌ Error en logout:', error.message);
      res.status(500).json({
        error: "Error cerrando sesión"
      });
    }
  }

  // Generar hashes ZKP para registro
  generarHashesZKP(cedula, fecha_nacimiento, codigo_secreto) {
    const crypto = require('crypto');

    // Generar hash de cédula
    const cedulaHash = crypto.createHash('sha256').update(cedula).digest();
    const cedula_hash = Array.from(cedulaHash);

    // Generar hash de fecha
    const fechaHash = crypto.createHash('sha256').update(fecha_nacimiento).digest();
    const fecha_hash = Array.from(fechaHash);

    // Generar hash de código
    const codigoHash = crypto.createHash('sha256').update(codigo_secreto).digest();
    const codigo_hash = Array.from(codigoHash);

    return {
      cedula_hash,
      fecha_hash,
      codigo_hash
    };
  }

  // Obtener fecha de nacimiento de forma privada
  async obtenerFechaNacimientoPrivada(usuarioId) {
    const usuariosDemo = {
      1: "19900515", // juan_perez
      2: "19850310", // Ejemplo usuario 2
    };

    return usuariosDemo[usuarioId] || "19900515";
  }

  // Guardar sesión ZKP
  async guardarSesionZKP(usuario, proofHash, token, req) {
    try {
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
    } catch (dbError) {
      if (dbError.code === '23505') {
        await query(
          `UPDATE sesiones_zkp SET 
           usuario_id = $1, ip_address = $2, user_agent = $3, 
           verificado = $4, token_jwt = $5, fecha_creacion = NOW()
           WHERE proof_hash = $6`,
          [usuario.id, req.ip, req.get("User-Agent"), true, token, proofHash]
        );
      } else {
        throw dbError;
      }
    }
  }
}

module.exports = new AuthController();
