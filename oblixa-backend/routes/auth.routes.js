// ── Routes Authentification ──────────────────────
const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateProfile, deleteAccount, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const protect = require('../middleware/auth');

// Route publiques (sans token)
router.post('/register',       register);
router.post('/login',          login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// Routes protégées (token obligatoire)
router.get('/me',        protect, getMe);
router.put('/update',    protect, updateProfile);
router.delete('/delete', protect, deleteAccount);

module.exports = router;