// ── Routes Bons d'achat ──────────────────────────
const express = require('express');
const router  = express.Router();
const {
  getVouchers,
  getVoucherByCode,
  validerVoucher,
  createVoucher,
} = require('../controllers/voucher.controller');
const protect = require('../middleware/auth');

// Routes publiques
router.get('/',           getVouchers);
router.get('/:code',      getVoucherByCode);

// Routes protégées
router.post('/valider',   protect, validerVoucher);
router.post('/',          protect, createVoucher);

module.exports = router;