const crypto = require('crypto');

function calculateSHA256AsU32Array(number) {
    // Crear buffer de 64 bytes (como en ZoKrates)
    const buffer = Buffer.alloc(64);
    // Poner el número en los últimos 4 bytes
    buffer.writeUInt32BE(number, 60);
    
    // Calcular SHA256
    const hash = crypto.createHash('sha256').update(buffer).digest();
    
    // Convertir a array de u32[8]
    const u32Array = [];
    for (let i = 0; i < 8; i++) {
        u32Array.push(hash.readUInt32BE(i * 4));
    }
    
    return u32Array;
}

// Datos de ejemplo del usuario
const cedula = 12345678;
const fecha = 19900515; // 1990-05-15
const codigo = 9876;

console.log('=== HASHES PARA IDENTITY CIRCUIT ===');
console.log('\nCédula:', cedula);
console.log('Hash cédula:', calculateSHA256AsU32Array(cedula).join(' '));

console.log('\nFecha:', fecha);
console.log('Hash fecha:', calculateSHA256AsU32Array(fecha).join(' '));

console.log('\nCódigo:', codigo);  
console.log('Hash código:', calculateSHA256AsU32Array(codigo).join(' '));

console.log('\n=== COMANDO PARA ZOKRATES ===');
const hashCedula = calculateSHA256AsU32Array(cedula).join(' ');
const hashFecha = calculateSHA256AsU32Array(fecha).join(' ');
const hashCodigo = calculateSHA256AsU32Array(codigo).join(' ');

console.log(`.\zk-identity.ps1 compute-witness -a ${cedula} ${fecha} ${codigo} ${hashCedula} ${hashFecha} ${hashCodigo}`);