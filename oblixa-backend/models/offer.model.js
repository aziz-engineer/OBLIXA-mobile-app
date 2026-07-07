// ── Modèle Offres / Promotions ───────────────────
const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'La marque est obligatoire'],
    },
    category: {
      type: String,
      enum: [
        'Restaurants', 'Voyage', 'Shopping', 'Santé', 
        'Loisirs', 'Éducation', 'Informatique', 'Sport'
      ],
      required: true,
    },
    discount: {
      type: String,
      required: true, // "-30%", "-20DT", etc
    },
    description: {
      type: String,
      required: true,
    },
    conditions: {
      type: String,
      default: '',
    },
    points: {
      type: Number,
      required: true, // Points required to use
    },
    coupons: {
      type: Number,
      default: 10,
      min: 0,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    bgColor: {
      type: String,
      required: true, // HEX color
    },
    imageUrl: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
    duree: {
      type: String,
      default: '30 Jours',
    },
    expireDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model('Offer', OfferSchema);