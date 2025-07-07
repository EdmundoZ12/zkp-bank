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

module.exports = router;
