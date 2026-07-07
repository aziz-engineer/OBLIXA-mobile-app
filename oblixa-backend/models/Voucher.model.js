const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
  {
    // ── Catalogue fidélité (redeemable avec points) ──
    type: { type: String, enum: ['bon_achat', 'hotel', 'trip'], default: 'bon_achat' },
    partner: { type: String }, // "Aziza", "Carrefour", nom hotel...
    titre: { type: String, required: true },
    description: { type: String, default: '' },
    pointsCost: { type: Number, default: 0 }, // 0 si le voucher n'est pas lié aux points
    imageUrl: { type: String },
    stock: { type: Number, default: null }, // null = illimité
    active: { type: Boolean, default: true },

    // ── Utilisation comme code promo (requis par order.controller.js) ──
    code: { type: String, unique: true, sparse: true },
    typeRemise: { type: String, enum: ['pourcentage', 'montant'], default: 'montant' },
    valeurRemise: { type: Number, default: 0 },
    utilisationsMax: { type: Number, default: 1 },
    utilisationsActuelles: { type: Number, default: 0 },
    dateExpiration: { type: Date },

    // ── Instance attribuée à un user après redeem par points ──
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isRedeemed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['available', 'pending', 'confirmed', 'used', 'cancelled'],
      default: 'available',
    },
    redeemedAt: { type: Date },
  },
  { timestamps: true }
);

// Utilisée par order.controller.js: voucher.estValide()
voucherSchema.methods.estValide = function () {
  if (!this.active) return false;
  if (this.dateExpiration && this.dateExpiration < new Date()) return false;
  if (this.utilisationsMax && this.utilisationsActuelles >= this.utilisationsMax) return false;
  return true;
};

module.exports = mongoose.model('Voucher', voucherSchema);
