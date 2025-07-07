const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class ZKPService {
  constructor() {
    this.circuitPath = path.join(__dirname, '../../../circuits/identity');
    this.dockerCommand = 'docker run -i --rm -v';
  }

  // Verificar prueba ZKP usando ZoKrates real y blockchain
  async verificarPrueba(proof, publicSignals, expectedHashes) {
    try {
      console.log('🔍 Verificando prueba ZKP completa...');

      // 1. Validar que los hashes públicos coincidan con los esperados
      const hashesValidos = this.validarHashesPublicos(publicSignals, expectedHashes);
      if (!hashesValidos) {
        console.log('❌ Hashes públicos no coinciden');
        return false;
      }

      // 2. Verificar en blockchain
      const blockchainValida = await this.verificarConBlockchain(proof, publicSignals);
      if (!blockchainValida) {
        console.log('❌ Verificación blockchain falló');
        return false;
      }

      console.log('✅ Prueba ZKP válida (hashes + blockchain)');
      return true;

    } catch (error) {
      console.error('❌ Error verificando prueba ZKP:', error.message);
      return false;
    }
  }

  // Generar prueba ZKP con datos del usuario
  async generarPrueba(cedula, fecha_nacimiento, codigo_secreto, expectedHashes) {
    try {
      console.log('🔧 Generando prueba ZKP con ZoKrates...');

      // Preparar comando para ZoKrates
      const witnessCommand = this.construirComandoWitness(
        cedula,
        fecha_nacimiento,
        codigo_secreto,
        expectedHashes
      );

      // Generar witness
      await this.ejecutarComandoZokrates(witnessCommand);

      // Generar prueba
      await this.ejecutarComandoZokrates('generate-proof');

      // Leer archivo de prueba generado
      const proof = await this.leerArchivoPrueba();

      console.log('✅ Prueba ZKP generada exitosamente');
      return proof;

    } catch (error) {
      console.error('❌ Error generando prueba:', error.message);
      throw error;
    }
  }

  // Verificar prueba con ZoKrates real en Docker
  async verificarConZokratesReal(proof) {
    try {
      // Escribir prueba a archivo temporal
      const proofPath = path.join(this.circuitPath, 'temp_proof.json');
      await fs.promises.writeFile(proofPath, JSON.stringify(proof));

      // Ejecutar verificación con ZoKrates
      const verifyCommand = 'verify';
      const result = await this.ejecutarComandoZokrates(verifyCommand);

      // Limpiar archivo temporal
      await fs.promises.unlink(proofPath).catch(() => { });

      // Parsear resultado
      return result.includes('PASS') || result.includes('true');

    } catch (error) {
      console.error('Error en verificación ZoKrates:', error.message);
      return false;
    }
  }

  // Verificar prueba con blockchain real
  async verificarConBlockchain(proof, publicSignals) {
    try {
      const blockchainService = require('./blockchainService');
      return await blockchainService.verificarPruebaEnBlockchain(proof, publicSignals);
    } catch (error) {
      console.error('Error en verificación blockchain:', error.message);
      return false;
    }
  }

  // Ejecutar comando ZoKrates en Docker
  async ejecutarComandoZokrates(comando) {
    return new Promise((resolve, reject) => {
      const circuitPath = path.resolve(this.circuitPath).replace(/\\/g, '/');

      // Comando Docker para ZoKrates
      const dockerCmd = `docker run -i --rm -v "${circuitPath}:/home/zokrates/code" -w /home/zokrates/code zokrates/zokrates:latest zokrates ${comando}`;

      console.log(`🐳 Ejecutando: ${comando}`);

      exec(dockerCmd, {
        timeout: 30000,  // 30 segundos timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      }, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error ZoKrates:', error.message);
          reject(error);
          return;
        }

        if (stderr && !stderr.includes('WARNING')) {
          console.error('⚠️ ZoKrates stderr:', stderr);
        }

        console.log('📋 ZoKrates output:', stdout);
        resolve(stdout);
      });
    });
  }

  // Construir comando witness para ZoKrates
  construirComandoWitness(cedula, fecha, codigo, expectedHashes) {
    // Convertir hashes esperados a string de argumentos
    const cedulaArgs = expectedHashes.cedula_hash.join(' ');
    const fechaArgs = expectedHashes.fecha_hash.join(' ');
    const codigoArgs = expectedHashes.codigo_hash.join(' ');

    return `compute-witness -a ${cedula} ${fecha} ${codigo} ${cedulaArgs} ${fechaArgs} ${codigoArgs}`;
  }

  // Leer archivo de prueba generado por ZoKrates
  async leerArchivoPrueba() {
    try {
      const proofPath = path.join(this.circuitPath, 'proof.json');
      const proofContent = await fs.promises.readFile(proofPath, 'utf8');
      return JSON.parse(proofContent);
    } catch (error) {
      throw new Error(`Error leyendo prueba: ${error.message}`);
    }
  }

  // Validar que los hashes públicos coincidan
  validarHashesPublicos(publicSignals, expectedHashes) {
    try {
      if (!publicSignals || !Array.isArray(publicSignals)) {
        return false;
      }

      // Convertir arrays para comparación
      const receivedHashes = this.convertirPublicSignalsAHashes(publicSignals);

      // Comparar cada hash
      const cedulaMatch = this.compararArrays(receivedHashes.cedula, expectedHashes.cedula_hash);
      const fechaMatch = this.compararArrays(receivedHashes.fecha, expectedHashes.fecha_hash);
      const codigoMatch = this.compararArrays(receivedHashes.codigo, expectedHashes.codigo_hash);

      console.log(`🔍 Validación hashes - Cédula: ${cedulaMatch}, Fecha: ${fechaMatch}, Código: ${codigoMatch}`);

      return cedulaMatch && fechaMatch && codigoMatch;

    } catch (error) {
      console.error('❌ Error validando hashes:', error.message);
      return false;
    }
  }

  // Convertir publicSignals a estructura de hashes
  convertirPublicSignalsAHashes(publicSignals) {
    // Los publicSignals vienen como: [cedula_hash[8], fecha_hash[8], codigo_hash[8]]
    return {
      cedula: publicSignals.slice(0, 8),
      fecha: publicSignals.slice(8, 16),
      codigo: publicSignals.slice(16, 24)
    };
  }

  // Comparar dos arrays de números
  compararArrays(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return false;
    }

    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (parseInt(arr1[i]) !== parseInt(arr2[i])) {
        return false;
      }
    }

    return true;
  }

  // Generar hash de prueba para evitar replay attacks
  generarHashPrueba(proof) {
    const proofString = JSON.stringify(proof);
    return crypto.createHash('sha256').update(proofString).digest('hex');
  }

  // Verificar que una prueba no se haya usado antes
  async verificarReplayAttack(proofHash) {
    const { query } = require('../../database/connection');

    try {
      const result = await query(
        'SELECT id FROM sesiones_zkp WHERE proof_hash = $1',
        [proofHash]
      );

      return result.rows.length === 0; // True si no se ha usado antes
    } catch (error) {
      console.error('Error verificando replay attack:', error.message);
      return false;
    }
  }

  // Verificar que ZoKrates está disponible
  async verificarZokratesDisponible() {
    try {
      await this.ejecutarComandoZokrates('--version');
      return true;
    } catch (error) {
      console.error('❌ ZoKrates no disponible:', error.message);
      return false;
    }
  }
}

module.exports = new ZKPService();