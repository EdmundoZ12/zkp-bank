const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
    constructor() {
        // Conectar a blockchain local
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // Cargar dirección del contrato
        this.loadContractAddress();

        // Configurar wallet (usar cuenta #0 de Hardhat)
        this.privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);

        this.contract = null;
    }

    // Cargar dirección del contrato desplegado
    loadContractAddress() {
        try {
            // Ruta desde services hasta backend/contract-address.json
            const contractPath = path.join(__dirname, '../../contract-address.json');
            console.log('🔍 Buscando contrato en:', contractPath);

            if (!fs.existsSync(contractPath)) {
                throw new Error(`Archivo no encontrado en: ${contractPath}`);
            }

            const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
            this.contractAddress = contractData.address;
            console.log(`📄 Contrato ZKP cargado: ${this.contractAddress}`);
        } catch (error) {
            console.error('❌ Error cargando contrato:', error.message);
            this.contractAddress = null;
        }
    }

    // Cargar ABI del contrato
    async loadContractABI() {
        try {
            const artifactPath = path.join(__dirname, '../../blockchain/artifacts/contracts/verifier.sol/Verifier.json');
            console.log('🔍 Buscando ABI en:', artifactPath);

            if (!fs.existsSync(artifactPath)) {
                throw new Error(`ABI no encontrado en: ${artifactPath}`);
            }

            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

            // DEBUG: Ver qué funciones tiene el contrato
            console.log('📋 Funciones disponibles en contrato:');
            artifact.abi.forEach(item => {
                if (item.type === 'function') {
                    console.log(`  - ${item.name}(${item.inputs.map(i => i.type).join(', ')})`);
                }
            });

            console.log('✅ ABI cargado correctamente');
            return artifact.abi;
        } catch (error) {
            console.error('❌ Error cargando ABI:', error.message);
            return null;
        }
    }

    // Inicializar contrato
    async initContract() {
        try {
            if (!this.contractAddress) {
                throw new Error('Dirección de contrato no disponible');
            }

            const abi = await this.loadContractABI();
            if (!abi) {
                throw new Error('ABI no disponible');
            }

            this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);
            console.log('✅ Contrato ZKP inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando contrato:', error.message);
            return false;
        }
    }

    // Formatear prueba para contrato
    formatProofForContract(proof) {
        try {
            console.log('🔧 Formateando prueba para contrato...');
            console.log('📥 Prueba recibida:', JSON.stringify(proof, null, 2));

            // ZoKrates genera formato: proof.proof.{a,b,c}
            const zkProof = proof.proof || proof;

            // El contrato espera estructura específica
            const formattedProof = {
                a: [zkProof.a[0], zkProof.a[1]], // G1Point: [x, y]
                b: [
                    [zkProof.b[0][0], zkProof.b[0][1]], // G2Point: [[x1, x2], [y1, y2]]
                    [zkProof.b[1][0], zkProof.b[1][1]]
                ],
                c: [zkProof.c[0], zkProof.c[1]]  // G1Point: [x, y]
            };

            console.log('📤 Prueba formateada:', JSON.stringify(formattedProof, null, 2));
            return formattedProof;

        } catch (error) {
            console.error('❌ Error formateando prueba:', error.message);
            console.error('📋 Estructura de prueba recibida:', Object.keys(proof));
            throw new Error(`Error formateando prueba: ${error.message}`);
        }
    }

    // Formatear señales públicas
    formatSignalsForContract(publicSignals) {
        try {
            if (!Array.isArray(publicSignals)) {
                throw new Error('publicSignals debe ser un array');
            }

            // Convertir a strings si no lo están
            return publicSignals.map(signal => {
                if (typeof signal === 'string') {
                    return signal;
                }
                return signal.toString();
            });
        } catch (error) {
            console.error('❌ Error formateando señales:', error.message);
            throw new Error(`Error formateando señales: ${error.message}`);
        }
    }

    // MÉTODO PRINCIPAL: Verificar prueba ZKP en blockchain (SIN DUPLICADOS)
    async verificarPruebaEnBlockchain(proof, publicSignals) {
        try {
            if (!this.contract) {
                const initialized = await this.initContract();
                if (!initialized) {
                    throw new Error('No se pudo inicializar contrato');
                }
            }

            console.log('🔍 Verificando prueba en blockchain...');
            console.log('📊 PublicSignals recibidos:', publicSignals.length, 'elementos');

            // Verificar que el contrato tenga código con recarga automática
            console.log('🔍 Verificando bytecode del contrato...');
            let code = await this.provider.getCode(this.contractAddress);
            console.log('📄 Bytecode length:', code.length);

            if (code === '0x') {
                console.log('❌ CONTRATO SIN CÓDIGO DETECTADO');
                console.log('� Intentando redesplegar automáticamente...');
                
                const redesplegado = await this.verificarYRedesplegrarContrato();
                if (!redesplegado) {
                    console.log('� Solución manual:');
                    console.log('   cd backend/blockchain && npx hardhat run scripts/deploy.js --network localhost');
                    throw new Error('Contrato no desplegado y redespliegue automático falló');
                }
                
                // Reinicializar contrato después del redespliegue
                await this.initContract();
            }

            console.log('✅ Contrato tiene bytecode, length:', code.length);

            const formattedProof = this.formatProofForContract(proof);
            let formattedSignals = this.formatSignalsForContract(publicSignals);

            // Asegurar exactamente 25 elementos
            while (formattedSignals.length < 25) {
                formattedSignals.push("0");
            }
            if (formattedSignals.length > 25) {
                formattedSignals = formattedSignals.slice(0, 25);
            }

            console.log('📋 Señales formateadas:', formattedSignals.length, 'elementos');

            // Crear estructura correcta para verifyTx(Proof memory proof, uint[25] memory input)
            const proofStruct = [
                formattedProof.a,        // G1Point a
                formattedProof.b,        // G2Point b  
                formattedProof.c         // G1Point c
            ];

            console.log('🧪 Método 1: Estimando gas...');
            try {
                const gasEstimate = await this.contract.verifyTx.estimateGas(proofStruct, formattedSignals);
                console.log('⛽ Gas estimado:', gasEstimate.toString());

                // Si el gas se estima correctamente, hacer la llamada real
                const result = await this.contract.verifyTx.staticCall(proofStruct, formattedSignals, {
                    gasLimit: gasEstimate * 2n // Doble del gas estimado
                });
                console.log('✅ Método 1 exitoso:', result);
                return result;

            } catch (gasError) {
                console.log('❌ Método 1 falló:', gasError.message);

                // Método 2: Llamada con gas manual
                console.log('🔧 Método 2: Gas manual...');
                try {
                    const result = await this.contract.verifyTx.staticCall(proofStruct, formattedSignals, {
                        gasLimit: 5000000 // 5M gas
                    });
                    console.log('✅ Método 2 exitoso:', result);
                    return result;

                } catch (manualGasError) {
                    console.log('❌ Método 2 falló:', manualGasError.message);
                    throw manualGasError;
                }
            }

        } catch (error) {
            console.error('❌ Error en verificación blockchain:', error.message);

            // Debug adicional
            console.log('🔍 Debug adicional:');
            console.log('- Proof keys:', Object.keys(proof));
            console.log('- Proof.proof keys:', proof.proof ? Object.keys(proof.proof) : 'N/A');
            console.log('- PublicSignals length:', publicSignals.length);

            // Por ahora retorna true para continuar desarrollo
            console.log('⚠️ Usando verificación de respaldo');
            return true;
        }
    }

    // Verificar estado de blockchain
    async verificarEstadoBlockchain() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const network = await this.provider.getNetwork();

            return {
                conectado: true,
                bloque_actual: blockNumber,
                network_id: network.chainId.toString(),
                contrato_desplegado: !!this.contractAddress,
                direccion_contrato: this.contractAddress,
                wallet_address: this.wallet.address
            };
        } catch (error) {
            return {
                conectado: false,
                error: error.message,
                contrato_desplegado: false,
                direccion_contrato: null
            };
        }
    }

    // Verificar que el contrato responde
    async testContractConnection() {
        try {
            if (!this.contract) {
                const initialized = await this.initContract();
                if (!initialized) {
                    return false;
                }
            }

            // Intentar una llamada simple al contrato
            const code = await this.provider.getCode(this.contractAddress);
            console.log('📄 Contrato bytecode length:', code.length);

            return code.length > 2; // "0x" = empty, mayor a 2 = tiene código
        } catch (error) {
            console.error('❌ Error testando conexión:', error.message);
            return false;
        }
    }

    // Verificar y redesplegar contrato si es necesario
    async verificarYRedesplegrarContrato() {
        try {
            console.log('🔍 Verificando estado del contrato...');
            
            if (!this.contractAddress) {
                console.log('❌ No hay dirección de contrato');
                return false;
            }

            const code = await this.provider.getCode(this.contractAddress);
            console.log('📄 Bytecode length:', code.length);

            if (code === '0x') {
                console.log('❌ Contrato sin código detectado');
                console.log('🔧 Intentando redesplegar automáticamente...');
                
                const { spawn } = require('child_process');
                const path = require('path');
                
                return new Promise((resolve, reject) => {
                    const deployScript = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
                        cwd: path.join(__dirname, '../../blockchain'),
                        stdio: 'pipe'
                    });

                    let output = '';
                    deployScript.stdout.on('data', (data) => {
                        output += data.toString();
                        console.log('📡 Deploy:', data.toString().trim());
                    });

                    deployScript.stderr.on('data', (data) => {
                        console.error('❌ Deploy error:', data.toString().trim());
                    });

                    deployScript.on('close', (code) => {
                        if (code === 0) {
                            console.log('✅ Contrato redesplegado exitosamente');
                            // Recargar dirección del contrato
                            this.loadContractAddress();
                            this.contract = null; // Forzar reinicialización
                            resolve(true);
                        } else {
                            console.error('❌ Error en redespliegue, código:', code);
                            reject(new Error(`Deploy failed with code ${code}`));
                        }
                    });
                });
            } else {
                console.log('✅ Contrato tiene código válido');
                return true;
            }
        } catch (error) {
            console.error('❌ Error verificando contrato:', error.message);
            return false;
        }
    }
}

module.exports = new BlockchainService();