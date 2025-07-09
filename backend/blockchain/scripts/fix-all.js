// backend/scripts/fix-all.js
const { fixContracts } = require('./fix-contracts');
const { setupSnarkjs } = require('./setup-snarkjs-complete');

async function fixAllIssues() {
    console.log('🚀 === ARREGLANDO TODOS LOS PROBLEMAS ===\n');

    try {
        // 1. Configurar archivos de contratos
        console.log('1️⃣ Configurando contratos...');
        const contractAddress = await fixContracts();
        console.log('✅ Contratos configurados\n');

        // 2. Configurar snarkjs
        console.log('2️⃣ Configurando snarkjs...');
        setupSnarkjs();
        console.log('✅ snarkjs configurado\n');

        // 3. Verificar que todo está en su lugar
        console.log('3️⃣ Verificando configuración...');

        const fs = require('fs');
        const path = require('path');

        // Verificar archivos de contratos
        const contractFile = path.join(__dirname, '../blockchain/contract-addresses.json');
        const legacyFile = path.join(__dirname, '../contract-address.json');

        console.log('📄 Archivos de contratos:');
        console.log(`  - Dual: ${fs.existsSync(contractFile) ? '✅' : '❌'}`);
        console.log(`  - Legacy: ${fs.existsSync(legacyFile) ? '✅' : '❌'}`);

        // Verificar archivos snarkjs
        const snarkjsDir = path.join(__dirname, '../../circuits/identity-snarkjs');
        const requiredFiles = ['verification_key.json', 'identity.wasm', 'identity.r1cs', 'identity_0001.zkey'];

        console.log('📄 Archivos snarkjs:');
        requiredFiles.forEach(file => {
            const exists = fs.existsSync(path.join(snarkjsDir, file));
            console.log(`  - ${file}: ${exists ? '✅' : '❌'}`);
        });

        console.log('\n🎉 === CONFIGURACIÓN COMPLETADA ===');
        console.log('💡 Ahora puedes probar el endpoint /zkp/compare-all');
        console.log('📋 El sistema funcionará en modo MOCK/SIMULADO para desarrollo');

        return true;

    } catch (error) {
        console.error('❌ Error configurando:', error.message);
        return false;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    fixAllIssues().then(success => {
        if (success) {
            console.log('\n✅ Configuración exitosa');
            process.exit(0);
        } else {
            console.log('\n❌ Configuración falló');
            process.exit(1);
        }
    });
}

module.exports = { fixAllIssues };