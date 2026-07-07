const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/produit.controller');

router.get('/', ctrl.getProduits);
router.get('/:id', ctrl.getProduitById);
router.post('/', auth, ctrl.createProduit); // TODO: ajouter middleware admin
router.post('/:id/redeem', auth, ctrl.redeemProduit);

module.exports = router;