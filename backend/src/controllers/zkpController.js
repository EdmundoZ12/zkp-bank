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

  // Generar prueba con snarkjs
  async generarPruebaSnarkjs(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`🔧 Generando prueba snarkjs para: ${username}`);

      // Validar datos requeridos
      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: ["username", "cedula", "fecha_nacimiento", "codigo_secreto"],
        });
      }

      // Buscar usuario para obtener hashes esperados
      const Usuario = require('../models/Usuario');
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

      // Generar prueba con snarkjs
      const snarkjsService = require('../services/snarkjsService');
      const proof = await snarkjsService.generarPrueba(
        cedula,
        fecha_nacimiento,
        codigo_secreto,
        expectedHashes
      );

      res.json({
        success: true,
        message: "Prueba snarkjs generada exitosamente",
        proof: proof.proof,
        publicSignals: proof.publicSignals,
        metadata: {
          username: username,
          timestamp: proof.timestamp,
          metodo: "snarkjs (Groth16)",
          framework: "Circom + snarkjs",
        },
      });

      console.log(`✅ Prueba snarkjs generada para: ${username}`);
    } catch (error) {
      console.error("❌ Error generando prueba snarkjs:", error.message);
      res.status(500).json({
        error: "Error generando prueba snarkjs",
        message: error.message,
      });
    }
  }

  // Verificar prueba snarkjs
  async verificarPruebaSnarkjs(req, res) {
    try {
      const { proof, publicSignals } = req.body;

      console.log('🔍 Verificando prueba snarkjs...');

      // Validar datos
      if (!proof || !publicSignals) {
        return res.status(400).json({
          error: "Datos requeridos: proof, publicSignals"
        });
      }

      // Verificar con snarkjs
      const snarkjsService = require('../services/snarkjsService');
      const isValid = await snarkjsService.verificarPrueba(proof, publicSignals);

      res.json({
        valid: isValid,
        method: "snarkjs",
        framework: "Circom + snarkjs",
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Verificación snarkjs: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

    } catch (error) {
      console.error("❌ Error verificando prueba snarkjs:", error.message);
      res.status(500).json({
        error: "Error verificando prueba snarkjs",
        message: error.message
      });
    }
  }

  // Comparar ZoKrates vs snarkjs
  async compararSistemas(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`⚖️ Comparando ZoKrates vs snarkjs para: ${username}`);

      // Validar datos
      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos para comparación",
          required: ["username", "cedula", "fecha_nacimiento", "codigo_secreto"]
        });
      }

      // Buscar usuario
      const Usuario = require('../models/Usuario');
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
      };

      // Generar pruebas con ambos sistemas y medir tiempo
      const resultados = {};

      // 1. ZoKrates
      try {
        console.log('🔧 Probando ZoKrates...');
        const zkpService = require('../services/zkpService');

        const tiempoInicioZokrates = Date.now();
        const pruebaZokrates = await zkpService.generarPrueba(
          cedula, fecha_nacimiento, codigo_secreto, expectedHashes
        );
        const tiempoZokrates = Date.now() - tiempoInicioZokrates;

        // Verificar
        const tiempoVerifInicioZokrates = Date.now();
        const validaZokrates = await zkpService.verificarPrueba(
          pruebaZokrates,
          [...usuario.cedula_hash, ...usuario.fecha_hash, ...usuario.codigo_hash],
          expectedHashes
        );
        const tiempoVerifZokrates = Date.now() - tiempoVerifInicioZokrates;

        resultados.zokrates = {
          tiempo_generacion_ms: tiempoZokrates,
          tiempo_verificacion_ms: tiempoVerifZokrates,
          tamano_prueba_bytes: JSON.stringify(pruebaZokrates).length,
          valida: validaZokrates,
          framework: "ZoKrates",
          curva: "BN254",
          esquema: "G16"
        };

      } catch (errorZokrates) {
        resultados.zokrates = {
          error: errorZokrates.message,
          disponible: false
        };
      }

      // 2. snarkjs
      try {
        console.log('🔧 Probando snarkjs...');
        const snarkjsService = require('../services/snarkjsService');

        const tiempoInicioSnarkjs = Date.now();
        const pruebaSnarkjs = await snarkjsService.generarPrueba(
          cedula, fecha_nacimiento, codigo_secreto, expectedHashes
        );
        const tiempoSnarkjs = Date.now() - tiempoInicioSnarkjs;

        // Verificar
        const tiempoVerifInicioSnarkjs = Date.now();
        const validaSnarkjs = await snarkjsService.verificarPrueba(
          pruebaSnarkjs.proof, pruebaSnarkjs.publicSignals
        );
        const tiempoVerifSnarkjs = Date.now() - tiempoVerifInicioSnarkjs;

        resultados.snarkjs = {
          tiempo_generacion_ms: tiempoSnarkjs,
          tiempo_verificacion_ms: tiempoVerifSnarkjs,
          tamano_prueba_bytes: JSON.stringify(pruebaSnarkjs.proof).length,
          valida: validaSnarkjs,
          framework: "snarkjs",
          curva: "BN254",
          esquema: "Groth16"
        };

      } catch (errorSnarkjs) {
        resultados.snarkjs = {
          error: errorSnarkjs.message,
          disponible: false
        };
      }

      // 3. Comparación final
      const comparacion = {
        usuario: username,
        timestamp: new Date().toISOString(),
        resultados: resultados,
        analisis: {}
      };

      // Análisis comparativo
      if (resultados.zokrates && resultados.snarkjs &&
        !resultados.zokrates.error && !resultados.snarkjs.error) {

        comparacion.analisis = {
          ganador_velocidad_generacion: resultados.zokrates.tiempo_generacion_ms < resultados.snarkjs.tiempo_generacion_ms ? 'ZoKrates' : 'snarkjs',
          ganador_velocidad_verificacion: resultados.zokrates.tiempo_verificacion_ms < resultados.snarkjs.tiempo_verificacion_ms ? 'ZoKrates' : 'snarkjs',
          ganador_tamano: resultados.zokrates.tamano_prueba_bytes < resultados.snarkjs.tamano_prueba_bytes ? 'ZoKrates' : 'snarkjs',
          diferencia_generacion_ms: Math.abs(resultados.zokrates.tiempo_generacion_ms - resultados.snarkjs.tiempo_generacion_ms),
          diferencia_verificacion_ms: Math.abs(resultados.zokrates.tiempo_verificacion_ms - resultados.snarkjs.tiempo_verificacion_ms),
          diferencia_tamano_bytes: Math.abs(resultados.zokrates.tamano_prueba_bytes - resultados.snarkjs.tamano_prueba_bytes)
        };
      }

      res.json(comparacion);

      console.log('✅ Comparación completada');

    } catch (error) {
      console.error("❌ Error en comparación:", error.message);
      res.status(500).json({
        error: "Error comparando sistemas ZKP",
        message: error.message
      });
    }
  }

  // Estado de snarkjs
  async verificarEstadoSnarkjs(req, res) {
    try {
      const snarkjsService = require('../services/snarkjsService');

      const disponible = await snarkjsService.verificarSnarkjsDisponible();
      const metricas = await snarkjsService.obtenerMetricas();

      res.json({
        snarkjs_disponible: disponible,
        framework: "Circom + snarkjs",
        circuit_path: snarkjsService.circuitPath,
        metricas: metricas,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      res.status(500).json({
        error: "Error verificando estado snarkjs",
        message: error.message,
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
  // ===== MÉTODOS zk-STARKs =====

  // Generar prueba con STARKs
  async generarPruebaSTARKs(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`🔧 Generando prueba zk-STARKs para: ${username}`);

      // Validar datos requeridos
      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos",
          required: ["username", "cedula", "fecha_nacimiento", "codigo_secreto"],
        });
      }

      // Buscar usuario
      const Usuario = require('../models/Usuario');
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

      // Generar prueba con STARKs
      const starksService = require('../services/starksService');
      const proof = await starksService.generarPrueba(
        cedula,
        fecha_nacimiento,
        codigo_secreto,
        expectedHashes
      );

      res.json({
        success: true,
        message: "Prueba zk-STARKs generada exitosamente",
        proof: proof.proof,
        publicSignals: proof.publicSignals,
        metadata: {
          username: username,
          timestamp: proof.timestamp,
          metodo: "zk-STARKs (Polygon Miden)",
          framework: "STARKs simulation",
          proof_size_bytes: proof.proof_size_bytes,
          processing_time_ms: proof.processing_time_ms,
          ventajas: ["Sin trusted setup", "Resistencia cuántica", "Transparencia"]
        },
        stark_info: proof.stark_specific
      });

      console.log(`✅ Prueba zk-STARKs generada para: ${username}`);
    } catch (error) {
      console.error("❌ Error generando prueba STARKs:", error.message);
      res.status(500).json({
        error: "Error generando prueba zk-STARKs",
        message: error.message,
      });
    }
  }

  // Verificar prueba STARKs
  async verificarPruebaSTARKs(req, res) {
    try {
      const { proof, publicSignals } = req.body;

      console.log('🔍 Verificando prueba zk-STARKs...');

      // Validar datos
      if (!proof || !publicSignals) {
        return res.status(400).json({
          error: "Datos requeridos: proof, publicSignals"
        });
      }

      // Verificar con STARKs
      const starksService = require('../services/starksService');
      const isValid = await starksService.verificarPrueba(proof, publicSignals);

      res.json({
        valid: isValid,
        method: "zk-STARKs",
        framework: "Polygon Miden (simulation)",
        advantages: ["No trusted setup", "Quantum resistant", "Transparent"],
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Verificación zk-STARKs: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

    } catch (error) {
      console.error("❌ Error verificando prueba STARKs:", error.message);
      res.status(500).json({
        error: "Error verificando prueba zk-STARKs",
        message: error.message
      });
    }
  }

  // Comparar TODOS los sistemas: ZoKrates vs snarkjs vs STARKs
  async compararTodosSistemas(req, res) {
    try {
      const { username, cedula, fecha_nacimiento, codigo_secreto } = req.body;

      console.log(`⚖️ Comparación TRIPLE: ZoKrates vs snarkjs vs STARKs para: ${username}`);

      // Validar datos
      if (!username || !cedula || !fecha_nacimiento || !codigo_secreto) {
        return res.status(400).json({
          error: "Datos requeridos para comparación triple",
          required: ["username", "cedula", "fecha_nacimiento", "codigo_secreto"]
        });
      }

      // Buscar usuario
      const Usuario = require('../models/Usuario');
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
      };

      const resultados = {};

      // 1. ZoKrates (zk-SNARKs)
      try {
        console.log('🔧 Probando ZoKrates...');
        const zkpService = require('../services/zkpService');

        const tiempoInicioZokrates = Date.now();
        const pruebaZokrates = await zkpService.generarPrueba(
          cedula, fecha_nacimiento, codigo_secreto, expectedHashes
        );
        const tiempoZokrates = Date.now() - tiempoInicioZokrates;

        const tiempoVerifInicioZokrates = Date.now();
        const validaZokrates = await zkpService.verificarPrueba(
          pruebaZokrates,
          [...usuario.cedula_hash, ...usuario.fecha_hash, ...usuario.codigo_hash],
          expectedHashes
        );
        const tiempoVerifZokrates = Date.now() - tiempoVerifInicioZokrates;

        resultados.zokrates = {
          tiempo_generacion_ms: tiempoZokrates,
          tiempo_verificacion_ms: tiempoVerifZokrates,
          tamano_prueba_bytes: JSON.stringify(pruebaZokrates).length,
          valida: validaZokrates,
          framework: "ZoKrates",
          tipo: "zk-SNARKs",
          curva: "BN254",
          esquema: "Groth16",
          trusted_setup: true,
          quantum_resistant: false
        };

      } catch (errorZokrates) {
        resultados.zokrates = {
          error: errorZokrates.message,
          disponible: false
        };
      }

      // 2. snarkjs (zk-SNARKs)
      try {
        console.log('🔧 Probando snarkjs...');
        const snarkjsService = require('../services/snarkjsService');

        const tiempoInicioSnarkjs = Date.now();
        const pruebaSnarkjs = await snarkjsService.generarPrueba(
          cedula, fecha_nacimiento, codigo_secreto, expectedHashes
        );
        const tiempoSnarkjs = Date.now() - tiempoInicioSnarkjs;

        const tiempoVerifInicioSnarkjs = Date.now();
        const validaSnarkjs = await snarkjsService.verificarPrueba(
          pruebaSnarkjs.proof, pruebaSnarkjs.publicSignals
        );
        const tiempoVerifSnarkjs = Date.now() - tiempoVerifInicioSnarkjs;

        resultados.snarkjs = {
          tiempo_generacion_ms: tiempoSnarkjs,
          tiempo_verificacion_ms: tiempoVerifSnarkjs,
          tamano_prueba_bytes: JSON.stringify(pruebaSnarkjs.proof).length,
          valida: validaSnarkjs,
          framework: "snarkjs",
          tipo: "zk-SNARKs",
          curva: "BN254",
          esquema: "Groth16",
          trusted_setup: true,
          quantum_resistant: false
        };

      } catch (errorSnarkjs) {
        resultados.snarkjs = {
          error: errorSnarkjs.message,
          disponible: false
        };
      }

      // 3. STARKs (zk-STARKs)
      try {
        console.log('🔧 Probando zk-STARKs...');
        const starksService = require('../services/starksService');

        const tiempoInicioStarks = Date.now();
        const pruebaStarks = await starksService.generarPrueba(
          cedula, fecha_nacimiento, codigo_secreto, expectedHashes
        );
        const tiempoStarks = Date.now() - tiempoInicioStarks;

        const tiempoVerifInicioStarks = Date.now();
        const validaStarks = await starksService.verificarPrueba(
          pruebaStarks.proof, pruebaStarks.publicSignals
        );
        const tiempoVerifStarks = Date.now() - tiempoVerifInicioStarks;

        resultados.starks = {
          tiempo_generacion_ms: tiempoStarks,
          tiempo_verificacion_ms: tiempoVerifStarks,
          tamano_prueba_bytes: pruebaStarks.proof_size_bytes,
          valida: validaStarks,
          framework: "Polygon Miden (simulation)",
          tipo: "zk-STARKs",
          hash_function: "RESCUE_PRIME",
          field: "Mersenne31",
          trusted_setup: false,
          quantum_resistant: true
        };

      } catch (errorStarks) {
        resultados.starks = {
          error: errorStarks.message,
          disponible: false
        };
      }

      // 4. Análisis comparativo completo
      const comparacion = {
        usuario: username,
        timestamp: new Date().toISOString(),
        sistemas_probados: 3,
        resultados: resultados,
        analisis: {},
        conclusiones: {}
      };

      // Análisis de rendimiento
      if (resultados.zokrates && resultados.snarkjs && resultados.starks &&
        !resultados.zokrates.error && !resultados.snarkjs.error && !resultados.starks.error) {

        // Ganadores por categoría
        const tiemposGen = {
          zokrates: resultados.zokrates.tiempo_generacion_ms,
          snarkjs: resultados.snarkjs.tiempo_generacion_ms,
          starks: resultados.starks.tiempo_generacion_ms
        };

        const tiemposVerif = {
          zokrates: resultados.zokrates.tiempo_verificacion_ms,
          snarkjs: resultados.snarkjs.tiempo_verificacion_ms,
          starks: resultados.starks.tiempo_verificacion_ms
        };

        const tamanos = {
          zokrates: resultados.zokrates.tamano_prueba_bytes,
          snarkjs: resultados.snarkjs.tamano_prueba_bytes,
          starks: resultados.starks.tamano_prueba_bytes
        };

        comparacion.analisis = {
          ganador_velocidad_generacion: Object.keys(tiemposGen).reduce((a, b) => tiemposGen[a] < tiemposGen[b] ? a : b),
          ganador_velocidad_verificacion: Object.keys(tiemposVerif).reduce((a, b) => tiemposVerif[a] < tiemposVerif[b] ? a : b),
          ganador_tamano_prueba: Object.keys(tamanos).reduce((a, b) => tamanos[a] < tamanos[b] ? a : b),

          tiempos_generacion: tiemposGen,
          tiempos_verificacion: tiemposVerif,
          tamanos_prueba: tamanos,

          diferencias: {
            generacion_snarkjs_vs_zokrates: Math.abs(tiemposGen.snarkjs - tiemposGen.zokrates),
            generacion_starks_vs_snarkjs: Math.abs(tiemposGen.starks - tiemposGen.snarkjs),
            tamano_starks_vs_snarkjs: Math.abs(tamanos.starks - tamanos.snarkjs)
          }
        };

        // Conclusiones académicas
        comparacion.conclusiones = {
          snarks_vs_starks: {
            setup: "STARKs ganan (sin trusted setup)",
            velocidad: "SNARKs ganan (más rápidos)",
            tamano: "SNARKs ganan (pruebas más pequeñas)",
            seguridad_cuantica: "STARKs ganan (resistentes)",
            transparencia: "STARKs ganan (sin ceremonias)",
            escalabilidad: "STARKs ganan (constraints ilimitados)"
          },
          recomendaciones: {
            produccion_actual: "snarkjs (velocidad + tamaño)",
            futuro_cuantico: "STARKs (resistencia cuántica)",
            desarrollo_rapido: "ZoKrates (más simple)",
            aplicaciones_grandes: "STARKs (escalabilidad)"
          }
        };
      }

      res.json(comparacion);
      console.log('✅ Comparación TRIPLE completada');

    } catch (error) {
      console.error("❌ Error en comparación triple:", error.message);
      res.status(500).json({
        error: "Error comparando sistemas ZKP",
        message: error.message
      });
    }
  }

  // Estado de STARKs
  async verificarEstadoSTARKs(req, res) {
    try {
      const starksService = require('../services/starksService');

      const disponible = await starksService.verificarSTARKsDisponible();
      const metricas = await starksService.obtenerMetricas();

      res.json({
        starks_disponible: disponible,
        framework: "Polygon Miden (simulation)",
        proof_system: "zk-STARKs",
        metricas: metricas,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      res.status(500).json({
        error: "Error verificando estado STARKs",
        message: error.message,
      });
    }
  }
}

module.exports = new ZKPController();
