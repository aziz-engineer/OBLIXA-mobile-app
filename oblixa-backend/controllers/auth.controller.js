const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// ── Générer un token JWT ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ── Inscription ──
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nom, email, password } = req.body;

    // Vérifier si l'email existe déjà
    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({ nom, email, password });

    // Répondre avec le token
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        points: user.points,
        niveau: user.niveau,
        abonnement: user.abonnement,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

// ── Connexion ──
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Vérifier le mot de passe
    const passwordCorrect = await user.comparePassword(password);
    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Répondre avec le token
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token: generateToken(user._id),
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        points: user.points,
        niveau: user.niveau,
        abonnement: user.abonnement,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

// ── Mot de passe oublié ──
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Aucun compte trouvé pour cet email' });
    }

    const resetCode = generateResetCode();
    await User.findByIdAndUpdate(
      user._id,
      {
        resetPasswordCode: resetCode,
        resetPasswordExpire: Date.now() + 15 * 60 * 1000,
      },
      { new: true }
    );

    const message = `Votre code de réinitialisation OBLIXA : ${resetCode}\n\nCode valable 15 minutes.`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation du mot de passe OBLIXA',
        text: message,
        html: `<p>Votre code de réinitialisation OBLIXA est : <strong>${resetCode}</strong></p><p>Code valable 15 minutes.</p>`,
      });

      return res.status(200).json({ success: true, message: 'Code de réinitialisation envoyé par email' });
    } catch (emailError) {
      console.error('forgotPassword: sendEmail failed for', user.email, emailError && (emailError.stack || emailError.message));
      return res.status(500).json({ success: false, message: 'Impossible d\'envoyer le code par email', error: emailError.message });
    }
  } catch (error) {
    console.error('forgotPassword: unexpected error', error && (error.stack || error.message));
    res.status(500).json({
      success: false,
      message: 'Impossible d\'envoyer le code par email',
      error: error.message,
    });
  }
};

// ── Réinitialiser le mot de passe ──
// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password, confirmPassword } = req.body;
    if (!email || !code || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordCode: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Code invalide ou expiré' });
    }

    user.password = password;
    user.resetPasswordCode = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

// ── Profil utilisateur connecté ──
// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

// ── Supprimer le compte utilisateur ──
// DELETE /api/auth/delete
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    await Transaction.deleteMany({ user: req.user.id });
    await user.deleteOne();

    return res.status(200).json({ success: true, message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du compte',
      error: error.message,
    });
  }
};

// ── Modifier le profil ──
// PUT /api/auth/update
exports.updateProfile = async (req, res) => {
  try {
    const { nom, telephone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nom, telephone },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour',
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};