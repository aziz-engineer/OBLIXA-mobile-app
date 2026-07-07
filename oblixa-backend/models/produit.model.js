const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // ex: "iPhone 15", "Trottinette Xiaomi"
    description: { type: String },
    brand: { type: String }, // ex: "Samsung", "Apple"...
   category: {
  type: String,
  enum: ['telephone', 'trottinette', 'voyage', 'hotel', 'bon_achat', 'loisirs', 'service', 'accessoire', 'divertissement', 'mode', 'beaute', 'sante', 'sport', 'Loisirs', 'culture', 'gastronomie', 'technologie', 'maison', 'jardin', 'automobile', 'education','electronique', 'musique', 'evenement', 'autre'],
  required: true,
},
  partner: { type: String },

    pointsCost: { type: Number, required: true }, // ex: 2200 points

    images: [{ type: String }],
    stock: { type: Number, default: null }, // null = illimité
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Produit', produitSchema);