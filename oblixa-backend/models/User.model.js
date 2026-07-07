const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définition du schéma utilisateur pour OBLIXA
const UserSchema = new mongoose.Schema(
  {
    dinarBalance: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    // Informations personnelles de l'utilisateur
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: 6,
    },
    telephone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },

    // Gestion active des abonnements (OBLIXA Premium & Free)
    accountType: {
      type: String,
      enum: ['free', 'premium', 'business'],
      default: 'free', // Par défaut, l'utilisateur est sur le plan gratuit
    },
    abonnement: {
      type: String,
      enum: ['actif', 'inactif', 'expire'],
      default: 'inactif', // Devient 'actif' après paiement du forfait premium
    },
    abonnementExpire: {
      type: Date,
      default: null, // Reste null tant qu'il n'y a pas d'abonnement payant actif
    },

    // Programme de fidélité et Portefeuille (Wallet)
    points: {
      type: Number,
      default: 0,
    },
    dinarBalance: {
      type: Number,
      default: 0, // Solde cumulé en TND après conversion ou recharge
    },
    niveau: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },

    // Historique des activités du programme de fidélité
    historiqueRoulette: [
      {
        pointsGagnes: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      }
    ],
    historiqueConversions: [
      {
        points: { type: Number, required: true },
        montant: { type: Number, required: true }, // Valeur convertie en TND
        date: { type: Date, default: Date.now },
      }
    ],
    historiqueDepenses: [
      {
        montant: { type: Number, required: true }, // Montant dépensé en TND
        offerId: { type: String, required: true },
        offerTitle: { type: String, default: '' },
        date: { type: Date, default: Date.now },
      }
    ],

    // Rôle de sécurité au sein de l'application
    role: {
      type: String,
      enum: ['user', 'admin', 'partner'],
      default: 'user',
    },

    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // Liste des vouchers favoris de l'utilisateur
    favoris: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
      },
    ],
  },
  {
    // Ajoute automatiquement les champs createdAt et updatedAt
    timestamps: true,
  }
);

// Middleware Pre-save : Hash du mot de passe avant sauvegarde en base de données
UserSchema.pre('save', async function (next) {
  // 1. Si le mot de passe n'a pas été modifié ou est vide, on passe au middleware suivant
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  // 2. Si le mot de passe est déjà haché (commence par les signatures bcrypt), on évite le re-hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }

  try {
    // 3. Génération du sel et hachage sécurisé du nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err); // Transmet l'erreur pour stopper la sauvegarde en cas de problème
  }
});

// Méthode personnalisée pour comparer les mots de passe lors de la connexion
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
  
};

module.exports = mongoose.model('User', UserSchema);