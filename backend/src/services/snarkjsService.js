const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const snarkjs = require('snarkjs');

class SnarkjsService {
    constructor() {
        this.circuitPath = path.join(__dirname, '../../../circuits/identity-snarkjs');
        this.wasmPath = path.join(this.circuitPath, 'identity.wasm');
        this.r1csPath = path.join(this.circuitPath, 'identity.r1cs');
        this.zkeyPath = path.join(this.circuitPath, 'identity_0001.zkey');
        this.vkPath = path.join(this.circuitPath, 'verification_key.json');
        this.useRealProofs = true; // Cambiar a false para usar mock
    }

    // Generar prueba snarkjs (real o mock)
    async generarPrueba(cedula, fecha_nacimiento, codigo_secreto, expectedHashes) {
        if (this.useRealProofs) {
            return await this.generarPruebaReal(cedula, fecha_nacimiento, codigo_secreto, expectedHashes);
        } else {
            return await this.generarPruebaMock(cedula, fecha_nacimiento, codigo_secreto, expectedHashes);
        }
    }

    // Generar prueba snarkjs REAL
    async generarPruebaReal(cedula, fecha_nacimiento, codigo_secreto, expectedHashes) {
        try {
            console.log('🔧 Generando prueba snarkjs REAL...');

            const startTime = Date.now();

            // Validar inputs básicos
            if (!cedula || !fecha_nacimiento || !codigo_secreto) {
                throw new Error('Inputs requeridos: cedula, fecha_nacimiento, codigo_secreto');
            }

            // Verificar archivos del circuito
            if (!fs.existsSync(this.wasmPath)) {
                throw new Error(`Archivo WASM no encontrado: ${this.wasmPath}`);
            }
            if (!fs.existsSync(this.zkeyPath)) {
                throw new Error(`Archivo ZKEY no encontrado: ${this.zkeyPath}`);
            }

            // Preparar inputs para el circuito
            // El circuito espera: cedula, fecha_nacimiento, codigo_secreto (private)
            // y expected_cedula, expected_fecha, expected_codigo (public)
            const input = {
                cedula: cedula,
                fecha_nacimiento: fecha_nacimiento,
                codigo_secreto: codigo_secreto,
                expected_cedula: expectedHashes.cedula || cedula,
                expected_fecha: expectedHashes.fecha || fecha_nacimiento,
                expected_codigo: expectedHashes.codigo || codigo_secreto
            };

            console.log('📊 Inputs del circuito:', {
                cedula: cedula,
                fecha_nacimiento: fecha_nacimiento,
                codigo_secreto: codigo_secreto,
                expected_cedula: input.expected_cedula,
                expected_fecha: input.expected_fecha,
                expected_codigo: input.expected_codigo
            });

            // Generar la prueba usando snarkjs
            console.log('⚡ Calculando witness y generando prueba...');
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                input,
                this.wasmPath,
                this.zkeyPath
            );

            const processingTime = Date.now() - startTime;

            console.log(`✅ Prueba snarkjs REAL generada en ${processingTime}ms`);
            console.log('📊 Public signals:', publicSignals);
            console.log('🔐 Proof preview:', {
                pi_a: proof.pi_a.slice(0, 2).map(x => x.substring(0, 10) + '...'),
                pi_b: proof.pi_b[0].slice(0, 2).map(x => x.substring(0, 10) + '...'),
                pi_c: proof.pi_c.slice(0, 2).map(x => x.substring(0, 10) + '...')
            });

            return {
                proof: proof,
                publicSignals: publicSignals,
                method: 'snarkjs-groth16-real',
                timestamp: new Date().toISOString(),
                processing_time_ms: processingTime,
                circuit_info: {
                    constraints: 'real',
                    variables: 'real',
                    public_signals: publicSignals.length,
                    private_signals: 3
                }
            };

        } catch (error) {
            console.error('❌ Error generando prueba snarkjs real:', error.message);
            console.error('🔍 Stack trace:', error.stack);
            throw error;
        }
    }

    // Generar prueba snarkjs MOCK (para fallback)
    async generarPruebaMock(cedula, fecha_nacimiento, codigo_secreto, expectedHashes) {
        try {
            console.log('🔧 Generando prueba snarkjs (mock para comparación)...');

            // Simular tiempo de procesamiento realista
            const startTime = Date.now();
            await this.simulateProcessingTime(800, 1200); // 800-1200ms como snarkjs real

            // Validar inputs básicos
            if (!cedula || !fecha_nacimiento || !codigo_secreto) {
                throw new Error('Inputs requeridos: cedula, fecha_nacimiento, codigo_secreto');
            }

            // Simular verificación de datos contra expectedHashes
            const inputsMatch = this.simulateInputValidation(
                cedula, fecha_nacimiento, codigo_secreto, expectedHashes
            );

            // Generar prueba mock en formato Groth16
            const proof = {
                pi_a: [
                    "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "a"),
                    "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "a2"),
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                pi_b: [
                    [
                        "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "b1"),
                        "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "b2")
                    ],
                    [
                        "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "b3"),
                        "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "b4")
                    ],
                    [
                        "0x0000000000000000000000000000000000000000000000000000000000000001",
                        "0x0000000000000000000000000000000000000000000000000000000000000000"
                    ]
                ],
                pi_c: [
                    "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "c"),
                    "0x" + this.generateConsistentHash(cedula + fecha_nacimiento + codigo_secreto + "c2"),
                    "0x0000000000000000000000000000000000000000000000000000000000000001"
                ],
                protocol: "groth16",
                curve: "bn128"
            };

            // Public signals: [valid]
            const publicSignals = [inputsMatch ? "1" : "0"];

            const processingTime = Date.now() - startTime;

            console.log(`✅ Prueba snarkjs mock generada en ${processingTime}ms`);
            console.log(`📊 Resultado: ${inputsMatch ? 'VÁLIDA' : 'INVÁLIDA'}`);

            return {
                proof: proof,
                publicSignals: publicSignals,
                method: 'snarkjs-groth16-mock',
                timestamp: new Date().toISOString(),
                processing_time_ms: processingTime,
                circuit_info: {
                    constraints: 1247, // Simulado basado en circuito real
                    variables: 1523,
                    public_signals: 1,
                    private_signals: 3
                }
            };

        } catch (error) {
            console.error('❌ Error generando prueba snarkjs mock:', error.message);
            throw error;
        }
    }

    // Verificar prueba snarkjs (real o mock)
    async verificarPrueba(proof, publicSignals) {
        if (this.useRealProofs) {
            return await this.verificarPruebaReal(proof, publicSignals);
        } else {
            return await this.verificarPruebaMock(proof, publicSignals);
        }
    }

    // Verificar prueba snarkjs REAL
    async verificarPruebaReal(proof, publicSignals) {
        try {
            console.log('🔍 Verificando prueba snarkjs REAL...');

            const startTime = Date.now();

            // Verificar archivo de clave de verificación
            if (!fs.existsSync(this.vkPath)) {
                throw new Error(`Archivo de verification key no encontrado: ${this.vkPath}`);
            }

            // Cargar clave de verificación
            const vKey = JSON.parse(fs.readFileSync(this.vkPath));

            // Verificar la prueba usando snarkjs
            const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

            const verificationTime = Date.now() - startTime;
            console.log(`✅ Verificación snarkjs REAL completada en ${verificationTime}ms: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

            return isValid;

        } catch (error) {
            console.error('❌ Error verificando prueba snarkjs real:', error.message);
            return false;
        }
    }

    // Verificar prueba snarkjs MOCK
    async verificarPruebaMock(proof, publicSignals) {
        try {
            console.log('🔍 Verificando prueba snarkjs mock...');

            const startTime = Date.now();
            await this.simulateProcessingTime(50, 100); // Verificación más rápida

            // Validar estructura de la prueba
            const hasValidStructure = proof &&
                proof.pi_a && Array.isArray(proof.pi_a) && proof.pi_a.length === 3 &&
                proof.pi_b && Array.isArray(proof.pi_b) && proof.pi_b.length === 3 &&
                proof.pi_c && Array.isArray(proof.pi_c) && proof.pi_c.length === 3 &&
                proof.protocol === "groth16" &&
                proof.curve === "bn128" &&
                publicSignals && Array.isArray(publicSignals);

            if (!hasValidStructure) {
                console.log('❌ Estructura de prueba inválida');
                return false;
            }

            // Verificar que el output público indica validez
            const isValid = publicSignals[0] === "1";

            const verificationTime = Date.now() - startTime;
            console.log(`✅ Verificación snarkjs mock completada en ${verificationTime}ms: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);

            return isValid;

        } catch (error) {
            console.error('❌ Error verificando prueba snarkjs mock:', error.message);
            return false;
        }
    }

    // Simular validación de inputs contra hashes esperados
    simulateInputValidation(cedula, fecha, codigo, expectedHashes) {
        // Para la demo, simulamos que los datos son válidos si coinciden con juan_perez
        const isJuanPerez = cedula === "12345678" &&
            fecha === "19900515" &&
            codigo === "9876";

        console.log(`🔍 Validación simulada: ${isJuanPerez ? 'DATOS CORRECTOS' : 'DATOS INCORRECTOS'}`);
        return isJuanPerez;
    }

    // Generar hash consistente para simular pruebas determinísticas
    generateConsistentHash(input) {
        return crypto.createHash('sha256')
            .update(input)
            .digest('hex')
            .substring(0, 64); // 32 bytes = 64 hex chars
    }

    // Simular tiempo de procesamiento realista
    async simulateProcessingTime(minMs, maxMs) {
        const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Verificar disponibilidad
    async verificarSnarkjsDisponible() {
        try {
            const wasmExists = fs.existsSync(this.wasmPath);
            const r1csExists = fs.existsSync(this.r1csPath);
            const zkeyExists = fs.existsSync(this.zkeyPath);
            const vkExists = fs.existsSync(this.vkPath);

            console.log(`📊 Estado snarkjs:`);
            console.log(`  - WASM compilado: ${wasmExists ? '✅' : '❌'}`);
            console.log(`  - R1CS disponible: ${r1csExists ? '✅' : '❌'}`);
            console.log(`  - ZKEY disponible: ${zkeyExists ? '✅' : '❌'}`);
            console.log(`  - Verification Key: ${vkExists ? '✅' : '❌'}`);
            console.log(`  - snarkjs library: ✅`);
            console.log(`  - Modo: ${this.useRealProofs ? 'REAL' : 'MOCK'}`);

            const allFilesExist = wasmExists && r1csExists && zkeyExists && vkExists;
            return allFilesExist;

        } catch (error) {
            console.error('❌ Error verificando snarkjs:', error.message);
            return false;
        }
    }

    // Métricas del circuito
    async obtenerMetricas() {
        try {
            const wasmExists = fs.existsSync(this.wasmPath);
            const r1csExists = fs.existsSync(this.r1csPath);
            const zkeyExists = fs.existsSync(this.zkeyPath);
            const vkExists = fs.existsSync(this.vkPath);

            const r1csSize = r1csExists ? fs.statSync(this.r1csPath).size : 0;
            const wasmSize = wasmExists ? fs.statSync(this.wasmPath).size : 0;
            const zkeySize = zkeyExists ? fs.statSync(this.zkeyPath).size : 0;

            return {
                disponible: wasmExists && r1csExists && zkeyExists && vkExists,
                mode: this.useRealProofs ? 'real' : 'mock',
                circuit_files: {
                    r1cs_exists: r1csExists,
                    wasm_exists: wasmExists,
                    zkey_exists: zkeyExists,
                    vk_exists: vkExists,
                    r1cs_size_bytes: r1csSize,
                    wasm_size_bytes: wasmSize,
                    zkey_size_bytes: zkeySize
                },
                circuit_metrics: {
                    constraints: this.useRealProofs ? 'real' : 1247,
                    variables: this.useRealProofs ? 'real' : 1523,
                    public_inputs: this.useRealProofs ? 'real' : 1,
                    private_inputs: 3,
                    framework: 'Circom + snarkjs',
                    scheme: 'Groth16',
                    curve: 'BN254'
                },
                performance: {
                    avg_proof_time_ms: this.useRealProofs ? 'variable' : '800-1200',
                    avg_verification_time_ms: this.useRealProofs ? 'variable' : '50-100',
                    proof_size_bytes: 256 // Groth16 proof size
                }
            };

        } catch (error) {
            console.error('❌ Error obteniendo métricas:', error.message);
            return {
                disponible: false,
                error: error.message
            };
        }
    }

    // Hash de prueba para replay protection
    generarHashPrueba(proof) {
        const proofString = JSON.stringify(proof);
        return crypto.createHash('sha256').update(proofString).digest('hex');
    }

    // Cambiar modo (para testing)
    setMode(useRealProofs) {
        this.useRealProofs = useRealProofs;
        console.log(`🔄 Modo cambiado a: ${this.useRealProofs ? 'REAL' : 'MOCK'}`);
    }

    // Convertir public signals de snarkjs al formato del contrato (25 elementos)
    convertirPublicSignalsParaContrato(publicSignals, cedula, fecha_nacimiento, codigo_secreto) {
        try {
            console.log('🔧 Convirtiendo public signals para contrato...');
            
            // El contrato espera 25 elementos: [cedula_hash[8], fecha_hash[8], codigo_hash[8], validacion]
            // Generar hashes usando la misma función que ZoKrates
            const calculateHash = require('../../../utils/calculate-hash');
            
            const cedulaHash = calculateHash.toFieldArray(cedula);
            const fechaHash = calculateHash.toFieldArray(fecha_nacimiento);
            const codigoHash = calculateHash.toFieldArray(codigo_secreto);
            
            // Crear array de 25 elementos
            const contractSignals = [
                ...cedulaHash,     // elementos 0-7: hash de cédula
                ...fechaHash,      // elementos 8-15: hash de fecha
                ...codigoHash,     // elementos 16-23: hash de código
                publicSignals[0]   // elemento 24: señal de validación
            ];
            
            console.log(`📊 Signals convertidos: ${contractSignals.length} elementos`);
            console.log('🔍 Validation signal:', publicSignals[0]);
            
            return contractSignals;
            
        } catch (error) {
            console.error('❌ Error convirtiendo signals:', error.message);
            // Fallback: rellenar con ceros hasta 25 elementos
            const fallback = [...publicSignals];
            while (fallback.length < 25) {
                fallback.push("0");
            }
            return fallback.slice(0, 25);
        }
    }
}

module.exports = new SnarkjsService();
