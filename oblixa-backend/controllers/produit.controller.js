const mongoose = require('mongoose');
const Produit = require('../models/produit.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

// GET /api/produits?category=telephone
exports.getProduits = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;
    const produits = await Produit.find(filter).sort({ pointsCost: 1 });
    res.status(200).json({ success: true, produits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/produits/:id
exports.getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    res.status(200).json({ success: true, produit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/produits  (admin)
exports.createProduit = async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json({ success: true, produit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/produits/:id/redeem   { shippingAddress }
exports.redeemProduit = async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address) {
    return res.status(400).json({ success: false, message: 'Adresse de livraison requise' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(req.user.id).session(session);
    const produit = await Produit.findById(req.params.id).session(session);

    if (!produit || !produit.active) throw new Error('Produit non disponible');
    if (produit.stock !== null && produit.stock <= 0) throw new Error('Stock épuisé');

    // fix: user.points (pas user.pointsBalance, qui n'existe pas dans le vrai User.model.js)
    if (user.points < produit.pointsCost) {
      throw new Error(`Points insuffisants: il te manque ${produit.pointsCost - user.points} points`);
    }

    user.points -= produit.pointsCost;
    await user.save({ session });

    if (produit.stock !== null) {
      produit.stock -= 1;
      await produit.save({ session });
    }

    const order = await Order.create(
      [
        {
          user: user._id,
          orderType: 'produit_redemption',
          produit: produit._id,
          pointsUsed: produit.pointsCost,
          shippingAddress,
          status: 'pending',
        },
      ],
      { session }
    );

    // fix: aligné sur le vrai schema Transaction (type/description/status, pas sourceType/balanceAfter)
    await Transaction.create(
      [
        {
          user: user._id,
          type: 'REDEEM',
          amount: produit.pointsCost,
          description: `Produit échangé : ${produit.title}`,
          status: 'SUCCESS',
          sourceRef: order[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Produit réservé, livraison en cours de traitement',
      order: order[0],
      remainingPoints: user.points,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
};
