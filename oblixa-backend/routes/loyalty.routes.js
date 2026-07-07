const express = require('express');
const router = express.Router();
const { 
  getPoints, 
  convertirPoints, 
  convertirDinar,
  addPoints, 
  spendDinar, 
  getHistory ,
  scanQrCode,
  checkRouletteStatus,
  spinRoulette
} = require('../controllers/loyalty.controller');
const protect = require('../middleware/auth');

// Routes protégées par le middleware
router.get('/points', protect, getPoints);
router.post('/convertir', protect, convertirPoints);
router.post('/convertir/from-dinar', protect, convertirDinar);
router.post('/add-points', protect, addPoints);
router.post('/spend-dinar', protect, spendDinar);
router.get('/history', protect, getHistory);
router.post('/scan', protect, scanQrCode);
router.get('/roulette/status', protect, checkRouletteStatus);
router.post('/roulette/spin', protect, spinRoulette);

module.exports = router;