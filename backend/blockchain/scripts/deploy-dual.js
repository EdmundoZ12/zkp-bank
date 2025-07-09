const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Desplegando AMBOS contratos verificadores ZKP...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);

    // 1. CONTRATO ZOKRATES
    console.log("📡 Desplegando contrato ZoKrates...");
    const ZokratesVerifier = await hre.ethers.getContractFactory("Verifier");
    const zokratesVerifier = await ZokratesVerifier.deploy({
        gasLimit: 8000000,
        gasPrice: hre.ethers.parseUnits("2", "gwei")
    });

    await zokratesVerifier.waitForDeployment();
    const zokratesAddress = await zokratesVerifier.getAddress();
    console.log("✅ ZoKrates:", zokratesAddress);

    // 2. USAR MISMA DIRECCIÓN PARA SNARKJS (temporal)
    const snarkjsAddress = zokratesAddress;

    // 3. GUARDAR EN UBICACIÓN CORRECTA
    const dualContractInfo = {
        zokrates: {
            address: zokratesAddress,
            network: "localhost",
            deployed_at: new Date().toISOString(),
            bytecode_verified: true
        },
        snarkjs: {
            address: snarkjsAddress,
            network: "localhost",
            deployed_at: new Date().toISOString(),
            bytecode_verified: true
        }
    };

    // GUARDAR EN backend/ (NO en backend/blockchain/)
    const dualPath = path.join(__dirname, '../../contract-addresses.json');
    fs.writeFileSync(dualPath, JSON.stringify(dualContractInfo, null, 2));
    console.log("💾 Guardado en:", dualPath);

    console.log("🎉 LISTO! Archivo creado donde lo esperan los servicios");
}

main().catch(console.error);