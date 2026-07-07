const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  reduceStock,
} = require('../controllers/offer.controller');

// Public routes
router.get('/', getOffers);
router.get('/:id', getOfferById);

// Admin routes ( authentication,  protect middleware)
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

// Route protégée: activation de l'offre - nécessite un compte premium actif
router.post('/:id/reduce-stock', protect, reduceStock);

module.exports = router;