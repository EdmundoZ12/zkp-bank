const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class DualBlockchainService {
    constructor() {
        // Conectar a blockchain local
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // Cargar direcciones de ambos contratos
        this.loadContractAddresses();

        // Configurar wallet (usar cuenta #0 de Hardhat)
        this.privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);

        this.zokratesContract = null;
        this.snarkjsContract = null;
    }

    // Cargar direcciones de ambos contratos
    loadContractAddresses() {
        try {
            const contractPath = path.join(__dirname, '../../blockchain/contract-addresses.json');
            console.log('🔍 Buscando contratos en:', contractPath);

            if (!fs.existsSync(contractPath)) {
                throw new Error(`Archivo no encontrado en: ${contractPath}`);
            }

            const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            this.zokratesAddress = contractData.zokrates.address;
            this.snarkjsAddress = contractData.snarkjs.address;
            
            console.log(`📄 Contrato ZoKrates: ${this.zokratesAddress}`);
            console.log(`📄 Contrato snarkjs: ${this.snarkjsAddress}`);
        } catch (error) {
            console.error('❌ Error cargando contratos:', error.message);
            this.zokratesAddress = null;
            this.snarkjsAddress = null;
        }
    }

    // Cargar ABI específico
    async loadContractABI(contractName) {
        try {
            let artifactPath;
            if (contractName === 'zokrates') {
                artifactPath = path.join(__dirname, '../../blockchain/artifacts/contracts/verifier.sol/Verifier.json');
            } else if (contractName === 'snarkjs') {
                artifactPath = path.join(__dirname, '../../blockchain/artifacts/contracts/verifier_snarkjs.sol/SnarkjsVerifier.json');
            } else {
                throw new Error(`Contrato desconocido: ${contractName}`);
            }

            console.log(`🔍 Buscando ABI ${contractName} en:`, artifactPath);

            if (!fs.existsSync(artifactPath)) {
                throw new Error(`ABI no encontrado en: ${artifactPath}`);
            }

            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

            console.log(`📋 Funciones disponibles en ${contractName}:`);
            artifact.abi.forEach(item => {
                if (item.type === 'function') {
                    console.log(`  - ${item.name}(${item.inputs.map(i => i.type).join(', ')})`);
                }
            });

            console.log(`✅ ABI ${contractName} cargado correctamente`);
            return artifact.abi;
        } catch (error) {
            console.error(`❌ Error cargando ABI ${contractName}:`, error.message);
            return null;
        }
    }

    // Inicializar contratos
    async initContracts() {
        try {
            if (!this.zokratesAddress || !this.snarkjsAddress) {
                throw new Error('Direcciones de contratos no disponibles');
            }

            // Inicializar contrato ZoKrates
            const zokratesAbi = await this.loadContractABI('zokrates');
            if (zokratesAbi) {
                this.zokratesContract = new ethers.Contract(this.zokratesAddress, zokratesAbi, this.wallet);
                console.log('✅ Contrato ZoKrates inicializado');
            }

            // Inicializar contrato snarkjs
            const snarkjsAbi = await this.loadContractABI('snarkjs');
            if (snarkjsAbi) {
                this.snarkjsContract = new ethers.Contract(this.snarkjsAddress, snarkjsAbi, this.wallet);
                console.log('✅ Contrato snarkjs inicializado');
            }

            return true;
        } catch (error) {
            console.error('❌ Error inicializando contratos:', error.message);
            return false;
        }
    }

    // Verificar prueba en blockchain usando el contrato apropiado
    async verificarPruebaEnBlockchain(proof, publicSignals, method = 'zokrates') {
        try {
            console.log(`🔍 Verificando prueba ${method} en blockchain...`);

            // Verificar disponibilidad del servicio primero
            const disponibilidad = await this.verificarDisponibilidad();
            if (!disponibilidad.disponible) {
                throw new Error(`Servicio blockchain no disponible: ${disponibilidad.error}`);
            }

            let contract, contractAddress;
            
            if (method === 'zokrates') {
                contract = this.zokratesContract;
                contractAddress = this.zokratesAddress;
            } else if (method === 'snarkjs') {
                contract = this.snarkjsContract;
                contractAddress = this.snarkjsAddress;
            } else {
                throw new Error(`Método desconocido: ${method}`);
            }

            console.log(`📊 Using ${method} contract at ${contractAddress}`);
            console.log(`📊 PublicSignals: ${publicSignals.length} elementos`);

            // Verificar bytecode
            const code = await this.provider.getCode(contractAddress);
            console.log(`📄 Bytecode length: ${code.length}`);

            if (code === '0x') {
                throw new Error(`Contrato ${method} sin código desplegado`);
            }

            // Formatear prueba y signals según el método
            let formattedProof, formattedSignals;
            
            if (method === 'zokrates') {
                formattedProof = this.formatProofForZokrates(proof);
                formattedSignals = this.formatSignalsForZokrates(publicSignals);
            } else {
                formattedProof = this.formatProofForSnarkjs(proof);
                formattedSignals = this.formatSignalsForSnarkjs(publicSignals);
            }

            console.log(`📋 Señales formateadas: ${formattedSignals.length} elementos`);

            // Crear estructura de prueba
            const proofStruct = [
                formattedProof.a,
                formattedProof.b,
                formattedProof.c
            ];

            // Verificar en contrato
            console.log('🧪 Estimando gas...');
            const gasEstimate = await contract.verifyTx.estimateGas(proofStruct, formattedSignals);
            console.log('⛽ Gas estimado:', gasEstimate.toString());

            const result = await contract.verifyTx.staticCall(proofStruct, formattedSignals, {
                gasLimit: gasEstimate * 2n
            });

            console.log(`✅ Resultado ${method}:`, result);
            return result;

        } catch (error) {
            console.error(`❌ Error verificando en blockchain ${method}:`, error.message);
            return false;
        }
    }

    // Verificar disponibilidad del servicio
    async verificarDisponibilidad() {
        try {
            // Verificar conexión a blockchain
            const network = await this.provider.getNetwork();
            console.log(`🌐 Conectado a red: ${network.name} (chainId: ${network.chainId})`);

            // Verificar contratos
            if (!this.zokratesAddress || !this.snarkjsAddress) {
                throw new Error('Direcciones de contratos no disponibles');
            }

            // Verificar que los contratos estén desplegados
            const zokratesCode = await this.provider.getCode(this.zokratesAddress);
            const snarkjsCode = await this.provider.getCode(this.snarkjsAddress);

            if (zokratesCode === '0x') {
                throw new Error('Contrato ZoKrates no desplegado');
            }

            if (snarkjsCode === '0x') {
                throw new Error('Contrato snarkjs no desplegado');
            }

            // Inicializar contratos si no están inicializados
            if (!this.zokratesContract || !this.snarkjsContract) {
                const initialized = await this.initContracts();
                if (!initialized) {
                    throw new Error('No se pudieron inicializar contratos');
                }
            }

            return {
                disponible: true,
                zokrates_address: this.zokratesAddress,
                snarkjs_address: this.snarkjsAddress,
                zokrates_bytecode_length: zokratesCode.length,
                snarkjs_bytecode_length: snarkjsCode.length,
            };

        } catch (error) {
            console.error('❌ Servicio dual blockchain no disponible:', error.message);
            return {
                disponible: false,
                error: error.message,
            };
        }
    }

    // Formatear prueba para ZoKrates (25 elementos)
    formatProofForZokrates(proof) {
        return this.formatProofGeneric(proof);
    }

    // Formatear prueba para snarkjs (4 elementos)
    formatProofForSnarkjs(proof) {
        return this.formatProofGeneric(proof);
    }

    // Formatear prueba genérico
    formatProofGeneric(proof) {
        try {
            let zkProof;
            if (proof.proof) {
                zkProof = proof.proof;
            } else if (proof.pi_a) {
                zkProof = {
                    a: proof.pi_a,
                    b: proof.pi_b,
                    c: proof.pi_c
                };
            } else {
                zkProof = proof;
            }

            return {
                a: [zkProof.a[0], zkProof.a[1]],
                b: [
                    [zkProof.b[0][0], zkProof.b[0][1]],
                    [zkProof.b[1][0], zkProof.b[1][1]]
                ],
                c: [zkProof.c[0], zkProof.c[1]]
            };
        } catch (error) {
            throw new Error(`Error formateando prueba: ${error.message}`);
        }
    }

    // Formatear señales para ZoKrates (25 elementos)
    formatSignalsForZokrates(publicSignals) {
        const signals = publicSignals.map(s => s.toString());
        while (signals.length < 25) {
            signals.push("0");
        }
        return signals.slice(0, 25);
    }

    // Formatear señales para snarkjs (4 elementos)
    formatSignalsForSnarkjs(publicSignals) {
        const signals = publicSignals.map(s => s.toString());
        return signals.slice(0, 4); // snarkjs usa solo 4 elementos
    }
}

module.exports = new DualBlockchainService();
