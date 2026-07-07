const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderType: { type: String, enum: ['cart', 'produit_redemption'], default: 'cart' },

    // ── Commande panier classique (order.controller.js) ──
    items: [
      {
        produitId: { type: String },
        nom: { type: String },
        prix: { type: Number },
        quantite: { type: Number },
      },
    ],
    voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
    sousTotal: { type: Number },
    remise: { type: Number, default: 0 },
    total: { type: Number },
    pointsGagnes: { type: Number, default: 0 },

    // ── Échange produit contre points (produit.controller.js) ──
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
    pointsUsed: { type: Number },
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
