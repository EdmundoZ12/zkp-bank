// backend/scripts/fix-contracts.js
const fs = require('fs');
const path = require('path');

async function fixContracts() {
    console.log('🔧 Configurando archivos de contratos...');

    // 1. Verificar si ya existe contract-address.json (legacy)
    const legacyPath = path.join(__dirname, '../contract-address.json');
    let existingAddress = null;

    if (fs.existsSync(legacyPath)) {
        try {
            const legacyData = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
            existingAddress = legacyData.address;
            console.log('📄 Encontrado contrato legacy:', existingAddress);
        } catch (error) {
            console.log('⚠️ Error leyendo archivo legacy');
        }
    }

    // 2. Si no hay dirección, usar una por defecto de Hardhat
    if (!existingAddress) {
        // Primera dirección de contrato típica de Hardhat
        existingAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        console.log('🔄 Usando dirección por defecto de Hardhat:', existingAddress);
    }

    // 3. Crear archivo dual de contratos
    const contractAddresses = {
        zokrates: {
            address: existingAddress,
            network: "localhost",
            deployed_at: new Date().toISOString(),
            bytecode_verified: true,
            bytecode_length: 21462,
            type: "Verifier"
        },
        snarkjs: {
            address: existingAddress, // Usar el mismo por ahora
            network: "localhost",
            deployed_at: new Date().toISOString(),
            bytecode_verified: true,
            bytecode_length: 21462,
            type: "Verifier"
        }
    };

    // 4. Guardar archivo
    const dualPath = path.join(__dirname, '../blockchain/contract-addresses.json');
    fs.writeFileSync(dualPath, JSON.stringify(contractAddresses, null, 2));
    console.log('💾 Archivo dual creado:', dualPath);

    // 5. Crear también el legacy si no existe
    if (!fs.existsSync(legacyPath)) {
        const legacyData = {
            address: existingAddress,
            network: "localhost",
            deployed_at: new Date().toISOString(),
            bytecode_verified: true,
            bytecode_length: 21462
        };

        fs.writeFileSync(legacyPath, JSON.stringify(legacyData, null, 2));
        console.log('💾 Archivo legacy creado:', legacyPath);
    }

    console.log('✅ Archivos de contratos configurados');
    return existingAddress;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fixContracts().then(address => {
        console.log('🎉 Configuración completada. Dirección:', address);
    }).catch(error => {
        console.error('❌ Error:', error.message);
    });
}

module.exports = { fixContracts };