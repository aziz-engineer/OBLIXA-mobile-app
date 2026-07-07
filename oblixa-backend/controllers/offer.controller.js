// ── Contrôleur Offres ────────────────────────────
const Offer = require('../models/offer.model');

// ── Récupérer toutes les offres ──────────────────
const getOffers = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { active: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { discount: { $regex: search, $options: 'i' } },
      ];
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Récupérer une offre par ID ───────────────────
const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable',
      });
    }

    res.status(200).json({ success: true, offer });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Créer une offre (Admin) ──────────────────────
const createOffer = async (req, res) => {
  try {
    const {
      title, brand, category, discount, points, coupons,
      bgColor, imageUrl, logoUrl, description, conditions,
      expireDate, stock, duree,
    } = req.body;

    if (!title || !brand || !category || !discount) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants',
      });
    }

    const offer = new Offer({
      title,
      brand,
      category,
      discount,
      points,
      coupons: coupons || 10,
      bgColor,
      imageUrl,
      logoUrl,
      description,
      conditions: conditions || '',
      expireDate: new Date(expireDate),
      stock: stock || 10,
      duree: duree || '30 Jours',
    });

    await offer.save();

    res.status(201).json({
      success: true,
      message: 'Offre créée',
      offer,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Mettre à jour une offre (Admin) ──────────────
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await Offer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offre mise à jour',
      offer,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Supprimer une offre (Admin) ──────────────────
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    await Offer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Offre supprimée',
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Réduire le stock (activation de l'offre) ────
// Route protégée: nécessite req.user (middleware protect) + compte premium actif
const reduceStock = async (req, res) => {
  try {
    const { id } = req.params;

    // ── Vérification accès premium ──
    const user = req.user; // injecté par le middleware protect

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
    }

    const estPremiumActif =
      user.accountType === 'premium' &&
      user.abonnement === 'actif' &&
      user.abonnementExpire &&
      new Date(user.abonnementExpire) > new Date();

    if (!estPremiumActif) {
      return res.status(403).json({
        success: false,
        message: "Tu n'as pas accès premium pour activer ce service. Abonne-toi pour débloquer les offres.",
      });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre introuvable',
      });
    }

    if (offer.stock <= 0 || offer.coupons <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock ou coupons épuisés',
      });
    }

    offer.stock -= 1;
    offer.coupons -= 1;
    await offer.save();

    res.status(200).json({
      success: true,
      message: 'Offre activée avec succès',
      offer,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  reduceStock,
};