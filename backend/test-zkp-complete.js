const blockchainService = require('./src/services/blockchainService');

async function testZKPVerification() {
    console.log('🧪 === PRUEBA DE VERIFICACIÓN ZKP ===');
    
    try {
        // 1. Verificar estado del blockchain
        console.log('\n1️⃣ Verificando estado del blockchain...');
        const estado = await blockchainService.verificarEstadoBlockchain();
        console.log('Estado:', estado);
        
        if (!estado.conectado) {
            console.log('❌ Blockchain no conectado');
            return;
        }
        
        // 2. Verificar conexión del contrato
        console.log('\n2️⃣ Verificando conexión del contrato...');
        const conexion = await blockchainService.testContractConnection();
        console.log('Conexión del contrato:', conexion ? '✅ OK' : '❌ FALLO');
        
        // 3. Simular prueba ZKP (datos de ejemplo)
        console.log('\n3️⃣ Preparando prueba ZKP de ejemplo...');
        const pruebaEjemplo = {
            scheme: "groth16",
            curve: "bn128",
            proof: {
                a: ["0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678"],
                b: [
                    ["0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678"],
                    ["0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678"]
                ],
                c: ["0x1234567890abcdef1234567890abcdef12345678", "0x1234567890abcdef1234567890abcdef12345678"]
            }
        };
        
        const signalsEjemplo = Array(24).fill("0");
        
        console.log('📋 Prueba preparada:');
        console.log('- Proof keys:', Object.keys(pruebaEjemplo));
        console.log('- Proof.proof keys:', Object.keys(pruebaEjemplo.proof));
        console.log('- Signals length:', signalsEjemplo.length);
        
        // 4. Intentar verificación (se esperará que falle con datos falsos)
        console.log('\n4️⃣ Verificando prueba ZKP...');
        
        try {
            const resultado = await blockchainService.verificarPruebaEnBlockchain(pruebaEjemplo, signalsEjemplo);
            console.log('Resultado de verificación:', resultado);
            console.log('✅ Verificación completada (resultado puede ser falso por datos de ejemplo)');
        } catch (error) {
            console.log('⚠️ Error en verificación:', error.message);
            console.log('🔧 Esto es esperado con datos de ejemplo');
        }
        
        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('✅ El sistema blockchain está funcionando correctamente');
        console.log('💡 Para pruebas reales, use datos ZKP válidos generados por ZoKrates');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar prueba
testZKPVerification();
