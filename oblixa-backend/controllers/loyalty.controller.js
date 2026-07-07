// ── Contrôleur Fidélité (Points, Dinars, Roulette) ──────────
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

const SEGMENTS_ROULETTE = [50, 100, 20, 500, 10, 250, 5, 1000];
const POIDS_ROULETTE    = [20, 12, 25,   2, 30,   5, 35,    1];//plus probable

// ── Récupérer les statistiques de fidélité ──────────
const getPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'points niveau dinarBalance accountType abonnement'
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const currentPoints = user.points || 0;
    let niveau = 'bronze';
    if (currentPoints >= 1000) niveau = 'platinum';
    else if (currentPoints >= 500) niveau = 'gold';
    else if (currentPoints >= 200) niveau = 'silver';

    if (user.niveau !== niveau) {
      // Mise à jour atomique du niveau pour éviter la validation complète du document
      await User.findByIdAndUpdate(req.user.id, { niveau }, { new: true });
    }

    return res.status(200).json({
      success: true,
      points: currentPoints,
      dinarBalance: user.dinarBalance || 0,
      niveau: user.niveau,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ── Convertir les points en dinars ──────────
const convertirPoints = async (req, res) => {
  try {
    const pts = Number(req.body.pointsAConvertir);
    if (!pts || pts <= 0) {
      return res.status(400).json({ success: false, message: 'Points invalides' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.points < pts) {
      return res.status(400).json({ success: false, message: 'Points insuffisants' });
    }

    const taux = user.accountType === 'premium' && user.abonnement === 'actif' ? 7 : 5;
    const montant = (pts / 100) * taux;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { points: -pts, dinarBalance: montant } },
      { new: true }
    );

    await Transaction.create({
      user: req.user.id,
      type: 'CONVERT',
      amount: montant,
      description: `Conversion de ${pts} points en ${montant.toFixed(3)} TND`,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      nouveauSolde: updatedUser.dinarBalance,
      pointsRestants: updatedUser.points,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur lors de la conversion', error: error.message });
  }
};

// ── Ajouter des points (recharge / test / admin) ──────────
const addPoints = async (req, res) => {
  try {
    const pts = Number(req.body.amount);
    if (!pts || pts <= 0) {
      return res.status(400).json({ success: false, message: 'Montant de points invalide' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const boost = user.accountType === 'premium' && user.abonnement === 'actif' ? 2 : 1;
    const finalAmount = pts * boost;

    await User.findByIdAndUpdate(req.user.id, { $inc: { points: finalAmount } });

    await Transaction.create({
      user: req.user.id,
      type: 'RECHARGE',
      amount: finalAmount,
      description: `Gain de points : +${finalAmount}`,
      status: 'SUCCESS',
    });

    return res.status(200).json({ success: true, message: 'Points ajoutés', pointsAjoutes: finalAmount });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ── Dépenser le solde en dinars ──────────
const spendDinar = async (req, res) => {
  try {
    const cost = Number(req.body.amount);
    const { offerTitle } = req.body;

    if (!cost || cost <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    if (user.dinarBalance < cost) {
      return res.status(400).json({ success: false, message: 'Solde insuffisant' });
    }

    await User.findByIdAndUpdate(req.user.id, { $inc: { dinarBalance: -cost } });

    await Transaction.create({
      user: req.user.id,
      type: 'SPEND',
      amount: cost,
      description: `Achat : ${offerTitle || 'Non spécifié'}`,
      status: 'SUCCESS',
    });

    return res.status(200).json({ success: true, message: 'Achat réussi' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur lors de la dépense', error: error.message });
  }
};

// ── Récupérer l'historique des transactions ──────────
const getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur historique', error: error.message });
  }
};

// ── Scanner un QR code partenaire ──────────
const scanQrCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) {
      return res.status(400).json({ success: false, message: 'QR code manquant' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const pointsGagnes = 50;

    await User.findByIdAndUpdate(user._id, { $inc: { points: pointsGagnes } });

    await Transaction.create({
      user: user._id,
      type: 'SCAN',
      amount: pointsGagnes,
      description: `Scan QR Code : +${pointsGagnes} points`,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: 'Points ajoutés par scan !',
      pointsGagnes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur lors du scan', error: error.message });
  }
};

// ── Vérifier si l'utilisateur peut jouer la roulette aujourd'hui ──────────
const checkRouletteStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('historiqueRoulette');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const canSpin = peutJouerAujourdhui(user.historiqueRoulette);
    return res.status(200).json({ success: true, canSpin });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

// ── Jouer la roulette quotidienne ──────────
const spinRoulette = async (req, res) => {
  try {
    // Récupérer l'historique pour vérifier s'il peut jouer
    const user = await User.findById(req.user.id).select('historiqueRoulette points');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    if (!peutJouerAujourdhui(user.historiqueRoulette)) {
      return res.status(400).json({ success: false, message: 'Tu as déjà joué la roulette aujourd\'hui' });
    }

    const segmentIndex = tirerSegmentPondere();
    const pointsGagnes = SEGMENTS_ROULETTE[segmentIndex];

    // Mise à jour atomique pour éviter validation du document entier
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: { points: pointsGagnes },
        $push: { historiqueRoulette: { pointsGagnes, date: new Date() } },
      },
      { new: true }
    );

    await Transaction.create({
      user: req.user.id,
      type: 'ROULETTE',
      amount: pointsGagnes,
      description: `Roulette quotidienne : +${pointsGagnes} points`,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      segmentIndex,
      pointsGagnes,
      newBalance: updatedUser.points,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur lors du spin', error: error.message });
  }
};

// ── Convertir des dinars en points (inverse de convertirPoints) ──────────
const convertirDinar = async (req, res) => {
  try {
    const montant = Number(req.body.montant);
    if (!montant || montant <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    // Normaliser le solde dinar en nombre pour éviter NaN lors des opérations
    const currentDinar = Number(user.dinarBalance || 0);

    // DEBUG: log incoming montant and current stored dinarBalance
    console.log(`convertirDinar: user=${req.user.id} montant=${montant} currentDinar=${currentDinar}`);

    if (currentDinar < montant) {
      return res.status(400).json({ success: false, message: 'Solde dinar insuffisant', currentDinar });
    }

    const taux = user.accountType === 'premium' && user.abonnement === 'actif' ? 7 : 5; // même taux que conversion inverse
    // pts = (montant * 100) / taux
    const pointsGagnes = Math.floor((montant * 100) / taux);
    if (pointsGagnes <= 0) {
      return res.status(400).json({ success: false, message: 'Montant trop faible pour convertir en points' });
    }

    // Appliquer conversion atomiquement pour éviter la validation complète du document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: { points: pointsGagnes, dinarBalance: -montant },
        $push: { historiqueConversions: { points: pointsGagnes, montant, date: new Date() } },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé après mise à jour' });
    }

    await Transaction.create({
      user: updatedUser._id,
      type: 'CONVERT',
      amount: pointsGagnes,
      description: `Conversion de ${montant} TND en ${pointsGagnes} points`,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      pointsGagnes,
      newPoints: updatedUser.points,
      newDinarBalance: updatedUser.dinarBalance,
    });
  } catch (error) {
    console.error('Error in convertirDinar:', error && error.stack ? error.stack : error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la conversion', error: error.message });
  }
};

// ── Fonctions utilitaires internes ──────────
function peutJouerAujourdhui(historiqueRoulette) {
  if (!historiqueRoulette || historiqueRoulette.length === 0) return true;

  const dernierSpin = historiqueRoulette[historiqueRoulette.length - 1];
  const aujourdhui = new Date();
  const dateSpin = new Date(dernierSpin.date);

  return (
    aujourdhui.getFullYear() !== dateSpin.getFullYear() ||
    aujourdhui.getMonth() !== dateSpin.getMonth() ||
    aujourdhui.getDate() !== dateSpin.getDate()
  );
}

function tirerSegmentPondere() {
  const total = POIDS_ROULETTE.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < POIDS_ROULETTE.length; i++) {
    if (rand < POIDS_ROULETTE[i]) return i;
    rand -= POIDS_ROULETTE[i];
  }
  return 0;
}

// ── Exportation des fonctions ──────────
module.exports = {
  getPoints,
  convertirPoints,
  convertirDinar,
  addPoints,
  spendDinar,
  getHistory,
  scanQrCode,
  checkRouletteStatus,
  spinRoulette,
};
