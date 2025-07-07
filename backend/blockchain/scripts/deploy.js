const hre = require("hardhat");

async function main() {
    console.log("🚀 Desplegando contrato verificador ZKP...");

    // Verificar gas y balance
    const [deployer] = await hre.ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("👤 Deployer:", deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

    // Obtener el contrato
    const Verifier = await hre.ethers.getContractFactory("Verifier");

    // Desplegar CON MÁS GAS
    console.log("📡 Desplegando en blockchain local con gas aumentado...");
    const verifier = await Verifier.deploy({
        gasLimit: 8000000, // 8M gas en lugar del default
        gasPrice: hre.ethers.parseUnits("2", "gwei")
    });

    console.log("⏳ Esperando confirmación...");
    await verifier.waitForDeployment();

    const contractAddress = await verifier.getAddress();
    console.log("✅ Contrato desplegado en:", contractAddress);

    // VERIFICAR QUE TIENE CÓDIGO
    const code = await deployer.provider.getCode(contractAddress);
    console.log("🔍 Verificación bytecode:");
    console.log("- Length:", code.length);
    console.log("- Tiene código:", code !== "0x" ? "✅ SÍ" : "❌ NO");

    if (code === "0x") {
        throw new Error("❌ FALLO: Contrato sin código después de deploy!");
    }

    console.log("🔗 Red: localhost (blockchain local)");

    // Guardar dirección para usar en backend
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        network: "localhost",
        deployed_at: new Date().toISOString(),
        bytecode_verified: true,
        bytecode_length: code.length
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