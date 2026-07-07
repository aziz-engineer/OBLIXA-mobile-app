const Subscription = require('../models/Subscription.model'); // fix: était './models/...' (chemin cassé)
const User = require('../models/User.model');

const PLAN_PRICES = { monthly: 19.9, yearly: 199 };

// POST /api/subscriptions/subscribe   { plan: "monthly" | "yearly" }
exports.subscribe = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ success: false, message: 'Plan invalide' });
    }

    // Hna tzid la logique paiement réel (Flouci / Paymee / carte...)

    const endDate = new Date();
    if (plan === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await Subscription.create({
      user: req.user.id,
      plan,
      price: PLAN_PRICES[plan],
      endDate,
      status: 'active',
    });

    // fix: on utilise les vrais champs du User (accountType/abonnement), pas isPremium/subscriptionId
    await User.findByIdAndUpdate(req.user.id, {
      accountType: 'premium',
      abonnement: 'actif',
      abonnementExpire: endDate,
    });

    res.status(201).json({ success: true, message: 'Compte premium activé', subscription });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/subscriptions/me
exports.mySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user.id, status: 'active' }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/subscriptions/cancel
exports.cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { user: req.user.id, status: 'active' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Aucun abonnement actif' });

    await User.findByIdAndUpdate(req.user.id, { accountType: 'free', abonnement: 'inactif' });
    res.status(200).json({ success: true, message: 'Abonnement annulé', subscription: sub });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
