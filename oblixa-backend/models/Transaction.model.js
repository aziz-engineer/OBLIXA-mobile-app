const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Aligné sur ce qu'utilise loyalty.controller.js (RECHARGE/CONVERT/SPEND/SCAN)
    // + REDEEM/SUBSCRIPTION pour produit/voucher/abonnement
    type: {
      type: String,
      enum: ['RECHARGE', 'CONVERT', 'SPEND', 'SCAN', 'REDEEM', 'SUBSCRIPTION','ROULETTE'],
      required: true,
    },

    amount: { type: Number, required: true },
    description: { type: String, default: '' },

    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },

    sourceRef: { type: mongoose.Schema.Types.ObjectId }, // optionnel: ref voucher/produit/order
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
