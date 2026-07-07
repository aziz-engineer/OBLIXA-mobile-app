// ── Routes Commandes ─────────────────────────────
const express = require('express');
const router  = express.Router();
const { createOrder, getMesCommandes } = require('../controllers/order.controller');
const protect = require('../middleware/auth');

// Toutes les routes sont protégées
router.post('/',                protect, createOrder);
router.get('/mes-commandes',    protect, getMesCommandes);

module.exports = router;