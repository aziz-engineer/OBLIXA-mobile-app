// ── Middleware de protection des routes ──────────
const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

const protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est dans le header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Pas de token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé — token manquant',
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter l'utilisateur à la requête
    req.user = await User.findById(decoded.id).select('-password');
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

module.exports = protect;