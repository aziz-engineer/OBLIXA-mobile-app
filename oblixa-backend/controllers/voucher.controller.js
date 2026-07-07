const mongoose = require('mongoose');
const Voucher = require('../models/Voucher.model');
const User = require('../models/User.model');
const Transaction = require('../models/Transaction.model');

// ── Récupérer les templates de vouchers disponibles dans le catalogue ──
exports.getVouchers = async (req, res) => {
  try {
    const filter = { active: true, isRedeemed: false };
    if (req.query.type) filter.type = req.query.type;
    const vouchers = await Voucher.find(filter).sort({ pointsCost: 1 });
    res.status(200).json({ success: true, vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Récupérer les vouchers possédés par l'utilisateur connecté ──
exports.myVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ user: req.user.id, isRedeemed: true }).sort({
      redeemedAt: -1,
    });
    res.status(200).json({ success: true, vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Ajouter un nouveau voucher au catalogue (Admin uniquement) ──
exports.createVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body);
    res.status(201).json({ success: true, voucher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Fonction pour récupérer un voucher par son code (Correction du crash) ──
exports.getVoucherByCode = async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ code: req.params.code.toUpperCase() });
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher non trouvé" });
    res.status(200).json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Valider un voucher (Vérification de validité avant utilisation) ──
exports.validerVoucher = async (req, res) => {
  try {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher || voucher.isRedeemed) {
      return res.status(404).json({ success: false, message: "Code invalide ou déjà utilisé" });
    }
    res.status(200).json({ success: true, voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Échanger des points contre un voucher (Processus transactionnel) ──
exports.redeem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Vérification du voucher source
    const template = await Voucher.findById(req.params.id).session(session);
    if (!template || !template.active || template.isRedeemed) {
      throw new Error('Voucher non disponible');
    }
    if (template.stock !== null && template.stock <= 0) throw new Error('Stock épuisé');

    // 2. Vérification des points de l'utilisateur
    const user = await User.findById(req.user.id).session(session);
    if (user.points < template.pointsCost) {
      throw new Error(`Points insuffisants: il te manque ${template.pointsCost - user.points} points`);
    }

    // 3. Débit des points
    user.points -= template.pointsCost;
    await user.save({ session });

    // 4. Gestion du stock
    if (template.stock !== null) {
      template.stock -= 1;
      await template.save({ session });
    }

    // 5. Création de l'instance du voucher pour l'utilisateur
    const dateExpiration = new Date();
    dateExpiration.setMonth(dateExpiration.getMonth() + (template.type === 'bon_achat' ? 3 : 6));

    const redeemed = await Voucher.create(
      [
        {
          type: template.type,
          partner: template.partner,
          titre: template.titre,
          description: template.description,
          pointsCost: template.pointsCost,
          imageUrl: template.imageUrl,
          stock: null,
          active: true,
          code: generateCode(),
          typeRemise: template.typeRemise,
          valeurRemise: template.valeurRemise,
          utilisationsMax: 1,
          dateExpiration,
          user: user._id,
          isRedeemed: true,
          status: 'pending',
          redeemedAt: new Date(),
        },
      ],
      { session }
    );

    // 6. Enregistrement de la transaction
    await Transaction.create(
      [
        {
          user: user._id,
          type: 'REDEEM',
          amount: template.pointsCost,
          description: `Voucher obtenu : ${template.titre}`,
          status: 'SUCCESS',
          sourceRef: redeemed[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Voucher obtenu',
      voucher: redeemed[0],
      remainingPoints: user.points,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Fonction utilitaire pour générer un code unique ──
function generateCode() {
  return 'OBX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}