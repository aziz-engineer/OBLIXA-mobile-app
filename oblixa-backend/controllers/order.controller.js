// ── Contrôleur Commandes ─────────────────────────
const Order   = require('../models/Order.model');
const Voucher = require('../models/Voucher.model');
const User    = require('../models/User.model');

// ── Créer une commande ───────────────────────────
// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, voucherCode } = req.body;

    // Calculer le sous-total
    const sousTotal = items.reduce(
      (acc, item) => acc + item.prix * item.quantite, 0
    );

    let remise = 0;
    let voucherId = null;

    // Appliquer le bon d'achat si fourni
    if (voucherCode) {
      const voucher = await Voucher.findOne({
        code: voucherCode.toUpperCase(),
      });

      if (voucher && voucher.estValide()) {
        voucherId = voucher._id;

        // Calculer la remise
        if (voucher.typeRemise === 'pourcentage') {
          remise = (sousTotal * voucher.valeurRemise) / 100;
        } else {
          remise = voucher.valeurRemise;
        }

        // Utiliser le bon
        voucher.utilisationsActuelles += 1;
        await voucher.save();
      }
    }

    const total = Math.max(0, sousTotal - remise);

    // Points gagnés (1 point par TND dépensé)
    const pointsGagnes = Math.floor(total);

    // Créer la commande
    const order = await Order.create({
      user: req.user.id,
      items,
      voucher: voucherId,
      sousTotal,
      remise,
      total,
      pointsGagnes,
    });

    // Ajouter les points à l'utilisateur
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: pointsGagnes },
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order,
      pointsGagnes,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

// ── Historique des commandes ─────────────────────
// GET /api/orders/mes-commandes
const getMesCommandes = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('voucher', 'code titre valeurRemise')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
    });
  }
};

module.exports = { createOrder, getMesCommandes };