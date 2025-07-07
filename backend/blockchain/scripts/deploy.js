const hre = require("hardhat");

async function main() {
    console.log("🚀 Desplegando contrato verificador ZKP...");

    // Obtener el contrato
    const Verifier = await hre.ethers.getContractFactory("Verifier");

    // Desplegar
    console.log("📡 Desplegando en blockchain local...");
    const verifier = await Verifier.deploy();

    await verifier.waitForDeployment();

    const contractAddress = await verifier.getAddress();

    console.log("✅ Contrato desplegado en:", contractAddress);
    console.log("🔗 Red: localhost (blockchain local)");

    // Guardar dirección para usar en backend
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        network: "localhost",
        deployed_at: new Date().toISOString()
    };

    fs.writeFileSync('../contract-address.json', JSON.stringify(contractInfo, null, 2));
    console.log("💾 Dirección guardada en contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error desplegando:", error);
        process.exit(1);
    });