const zkpService = require("../services/zkpService");
const Usuario = require("../models/Usuario");

class ZKPController {
  // Generar prueba ZKP para un usuario
  async generarPrueba(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`🔧 Generando prueba ZKP para: ${username}`);

      // Validar datos requeridos
      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: [
            "username",
            "cedula",
            "fecha_nacimiento",
            "codigo_secreto",
          ],
        });
      }

      // Buscar usuario para obtener hashes esperados
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

      // Generar prueba con ZoKrates real
      const proof = await zkpService.generarPrueba(
        cedula,
        fecha_nacimiento,
        codigo_secreto,
        expectedHashes
      );

      // Generar publicSignals
      const publicSignals = [
        ...usuario.cedula_hash,
        ...usuario.fecha_hash,
        ...usuario.codigo_hash,
      ];

      res.json({
        success: true,
        message: "Prueba ZKP generada exitosamente",
        proof: proof,
        publicSignals: publicSignals,
        metadata: {
          username: username,
          timestamp: new Date().toISOString(),
          metodo: "zk-SNARKs (ZoKrates)",
          constraints: "62060",
        },
      });

      console.log(`✅ Prueba ZKP generada para: ${username}`);
    } catch (error) {
      console.error("❌ Error generando prueba ZKP:", error.message);
      res.status(500).json({
        error: "Error generando prueba ZKP",
        message: error.message,
      });
    }
  }
  // Agregar ANTES del último }
  async debugHashes(req, res) {
    try {
      const { username, publicSignals } = req.body;

      const Usuario = require('../models/Usuario');
      const usuario = await Usuario.findByUsername(username);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const expectedHashes = {
        cedula_hash: usuario.cedula_hash,
        fecha_hash: usuario.fecha_hash,
        codigo_hash: usuario.codigo_hash
      };

      const zkpService = require('../services/zkpService');
      const hashesValidos = zkpService.validarHashesPublicos(publicSignals, expectedHashes);

      res.json({
        hashes_validos: hashesValidos,
        received_signals_count: publicSignals.length,
        expected_hashes: expectedHashes,
        received_first_8: publicSignals.slice(0, 8),
        expected_cedula: usuario.cedula_hash
      });

    } catch (error) {
      res.status(500).json({
        error: "Error en debug",
        message: error.message
      });
    }
  }

  // Agregar este método después de debugHashes
  async debugBlockchain(req, res) {
    try {
      const { proof, publicSignals } = req.body;

      console.log('🔍 Debug blockchain - Datos recibidos:');
      console.log('Proof keys:', Object.keys(proof));
      console.log('Proof.proof keys:', Object.keys(proof.proof || {}));
      console.log('PublicSignals length:', publicSignals.length);

      // Probar inicialización del contrato
      const blockchainService = require('../services/blockchainService');
      const estadoBlockchain = await blockchainService.verificarEstadoBlockchain();

      console.log('Estado blockchain:', estadoBlockchain);

      // Probar inicialización del contrato
      const contractInit = await blockchainService.initContract();

      // Intentar verificación
      let verificationResult = null;
      let verificationError = null;

      try {
        verificationResult = await blockchainService.verificarPruebaEnBlockchain(proof, publicSignals);
      } catch (error) {
        verificationError = error.message;
        console.error('Error en verificación:', error);
      }

      res.json({
        blockchain_estado: estadoBlockchain,
        contract_initialized: contractInit,
        verification_result: verificationResult,
        verification_error: verificationError,
        proof_format: {
          scheme: proof.scheme,
          curve: proof.curve,
          has_proof: !!proof.proof,
          proof_keys: proof.proof ? Object.keys(proof.proof) : null
        }
      });

    } catch (error) {
      res.status(500).json({
        error: "Error en debug blockchain",
        message: error.message,
        stack: error.stack
      });
    }
  }

  // Verificar estado de ZoKrates
  async verificarEstado(req, res) {
    try {
      const disponible = await zkpService.verificarZokratesDisponible();

      res.json({
        zokrates_disponible: disponible,
        docker_disponible: true, // Asumimos que Docker está corriendo
        circuito_path: zkpService.circuitPath,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: "Error verificando estado ZKP",
        message: error.message,
      });
    }
  }
}

module.exports = new ZKPController();
