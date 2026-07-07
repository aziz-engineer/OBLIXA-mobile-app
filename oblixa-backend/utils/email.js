const nodemailer = require('nodemailer');

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_SECURE,
  EMAIL_FROM,
  NODE_ENV,
} = process.env;

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE === 'true',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
    return cachedTransporter;
  }

  // En environnement de développement, utiliser un compte Ethereal pour tester les emails
  if (NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('⚠️  Aucun SMTP configuré — utilisation d\'un compte Ethereal pour l\'envoi d\'emails (dev).');
    return cachedTransporter;
  }

  throw new Error('Email SMTP configuration manquante. Configurez EMAIL_HOST, EMAIL_PORT, EMAIL_USER et EMAIL_PASS.');
}

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();

  const mailOptions = {
    from: EMAIL_FROM || EMAIL_USER || 'no-reply@oblixa.local',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  // Si on utilise Ethereal, logger l'URL de prévisualisation
  try {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('Email preview URL:', preview);
  } catch (e) {
    // ignore
  }

  return info;
};

module.exports = sendEmail;
