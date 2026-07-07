const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/subscription.controller');

router.post('/subscribe', auth, ctrl.subscribe);
router.get('/me', auth, ctrl.mySubscription);
router.post('/cancel', auth, ctrl.cancelSubscription);

module.exports = router;