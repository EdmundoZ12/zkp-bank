const express = require("express");
const zkpController = require("../controllers/zkpController");

const router = express.Router();

// POST /zkp/generate - Generar prueba ZKP
router.post("/generate", zkpController.generarPrueba);

// GET /zkp/status - Verificar estado de ZoKrates
router.get("/status", zkpController.verificarEstado);

// POST /zkp/debug-hashes - Debug validación de hashes
router.post('/debug-hashes', zkpController.debugHashes);

// Agregar esta línea
router.post('/debug-blockchain', zkpController.debugBlockchain);

// Rutas snarkjs
router.post('/snarkjs/generate', zkpController.generarPruebaSnarkjs);
router.post('/snarkjs/verify', zkpController.verificarPruebaSnarkjs);
router.get('/snarkjs/status', zkpController.verificarEstadoSnarkjs);

// Ruta de comparación
router.post('/compare', zkpController.compararSistemas);

// ===== RUTAS zk-STARKs =====
router.post('/starks/generate', zkpController.generarPruebaSTARKs);
router.post('/starks/verify', zkpController.verificarPruebaSTARKs);
router.get('/starks/status', zkpController.verificarEstadoSTARKs);

// ===== RUTA DE COMPARACIÓN TRIPLE =====
router.post('/compare-all', zkpController.compararTodosSistemas);

module.exports = router;
