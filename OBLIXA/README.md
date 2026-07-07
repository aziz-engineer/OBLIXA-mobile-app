# 🚀 OBLIXA – Mobile Loyalty & Rewards Platform

<p align="center">

![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo%20Router-v5-000020?style=for-the-badge)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

</p>

---

# 📱 About OBLIXA

**OBLIXA** is a professional full-stack mobile application developed during my internship.

The application provides an intelligent loyalty ecosystem where users can discover exclusive offers, earn loyalty points, spin a reward wheel, manage a digital wallet, convert points into Tunisian Dinar (TND), and subscribe to premium memberships.

The project follows a modern client-server architecture using **React Native (Expo)** for the mobile application and **Node.js + Express + MongoDB** for the backend REST API.

---

# ✨ Main Features

## 🔐 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Forgot Password via Email (Nodemailer)
- Reset Password
- User Profile Management

---

## 🎁 Offers

- Browse Offers
- Search Offers
- Filter by Category
- Offer Details
- Dynamic Data from MongoDB
- Coupon Availability

---

## ⭐ Loyalty Program

- Earn Loyalty Points
- Bronze • Silver • Gold • Platinum Levels
- Points History
- Loyalty Dashboard

---

## 🎡 Roulette

- Daily Reward Wheel
- Random Points
- Automatic Wallet Update
- Roulette History

---

## 💰 Wallet

- Wallet Balance (TND)
- Loyalty Points
- Convert Points into Wallet Balance
- Transactions History

---

## 👑 Premium Subscription

- Premium Membership
- Subscription Management
- Exclusive Premium Offers

---

## 🔔 Notifications

- Read Notifications
- Delete Notifications
- Real-Time Updates

---

# 🏗 Project Structure

```
OBLIXA/
│
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── services/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── offreDetails.tsx
│   │   ├── fidelite.tsx
│   │   ├── roulette.tsx
│   │   ├── notifications.tsx
│   │   ├── gerer-abonnement.tsx
│   │   ├── mes-abonnements.tsx
│   │   ├── contactez-nous.tsx
│   │   ├── qui-sommes-nous.tsx
│   │   ├── politique-confidentialite.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   ├── assets/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── context/
│   └── global.d.ts
│
├── oblixa-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── package.json
└── README.md
```

---

# 🛠 Technology Stack

## 📱 Frontend

- React Native
- Expo SDK
- Expo Router
- TypeScript (TSX)
- React Hooks
- Context API
- AsyncStorage
- Axios

---

## 🌐 Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Nodemailer

---

## 🧰 Tools

- MongoDB Compass
- Postman
- Git
- GitHub
- VS Code

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/OBLIXA.git

cd OBLIXA
```

---

## Backend

```bash
cd oblixa-backend

npm install
```

Create a `.env`

```env
PORT=5000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret

EMAIL_USER=your_email

EMAIL_PASS=your_password
```

Start the server

```bash
npm run dev
```

Server:

```
http://localhost:5000
```

---

## Frontend

```bash
npm install

npx expo start
```

or

```bash
npx expo start -c
```

Metro Bundler:

```
http://localhost:8081
```

---

# 📡 REST API

## Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Offers

```
GET /api/offers
GET /api/offers/:id
```

## Loyalty

```
GET /api/loyalty/points
POST /api/loyalty/roulette
POST /api/loyalty/convertir
GET /api/loyalty/historique
```

## Subscription

```
GET /api/subscriptions
POST /api/subscriptions
DELETE /api/subscriptions/:id
```

---

# 🗄 Database Collections

- Users
- Offers
- Loyalty
- Wallet
- Transactions
- Notifications
- Orders
- Products
- Subscriptions
- Vouchers

---

# 📸 Screenshots

```
screenshots/

├── login.png
├── register.png
├── home.png
├── offers.png
├── offer-details.png
├── wallet.png
├── loyalty.png
├── roulette.png
├── notifications.png
└── profile.png
```

---

# 🚀 Future Improvements

- D17 Payment Integration
- Wallet Recharge
- QR Code Coupons
- Push Notifications
- Admin Dashboard
- Analytics Dashboard
- AI Offer Recommendation
- Multi-language Support
- Dark / Light Mode

---

# 👨‍💻 Author

## Mohamed Aziz Omrani

**Full Stack Mobile Developer**

### Technologies

- React Native
- Expo
- TypeScript
- Node.js
- Express.js
- MongoDB
- REST API Development

---

# 📄 License

This project was developed during my internship for educational and portfolio purposes.

---

## ⭐ Support

If you like this project, don't forget to ⭐ the repository on GitHub.