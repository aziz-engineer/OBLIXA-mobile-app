const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes    = require('./routes/auth.routes');
const offerRoutes   = require('./routes/offer.routes');
const voucherRoutes = require('./routes/voucher.routes');
const orderRoutes   = require('./routes/order.routes');
const loyaltyRoutes = require('./routes/loyalty.routes');
const produitRoutes = require('./routes/produit.routes');
const subscriptionRoutes = require('./routes/Subscription.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/offers',   offerRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/loyalty',  loyaltyRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'OBLIXA API en ligne', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(' MongoDB connecté avec succès');
    app.listen(PORT, "0.0.0.0", () => {
      console.log(` Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });