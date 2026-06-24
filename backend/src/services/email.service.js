const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const isSmtpConfigured = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const sendVerificationEmail = async (email, fullName, token) => {
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;

  if (!isSmtpConfigured()) {
    console.log("SMTP non configuré.");
    console.log("Lien de vérification :", verificationUrl);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Confirmez votre compte",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:30px;">
        <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:12px;">
          <h2 style="color:#ff7a00;">Confirmation de votre compte</h2>

          <p>Bonjour ${fullName},</p>

          <p>
            Merci pour votre inscription sur la plateforme de gestion de stock et prêt de matériel.
          </p>

          <p>
            Pour activer votre compte, cliquez sur le bouton ci-dessous :
          </p>

          <a href="${verificationUrl}"
             style="display:inline-block; background:#ff7a00; color:#111; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
            Confirmer mon compte
          </a>

          <p style="margin-top:25px; color:#666;">
            Ce lien expire dans 24 heures.
          </p>
        </div>
      </div>
    `,
  });
};

const sendResetPasswordEmail = async (email, fullName, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  if (!isSmtpConfigured()) {
    console.log("SMTP non configuré.");
    console.log("Lien de réinitialisation :", resetUrl);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:30px;">
        <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:12px;">
          <h2 style="color:#ff7a00;">Réinitialisation du mot de passe</h2>

          <p>Bonjour ${fullName},</p>

          <p>
            Vous avez demandé la réinitialisation de votre mot de passe.
          </p>

          <p>
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>

          <a href="${resetUrl}"
             style="display:inline-block; background:#ff7a00; color:#111; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
            Réinitialiser mon mot de passe
          </a>

          <p style="margin-top:25px; color:#666;">
            Ce lien expire dans 1 heure.
          </p>

          <p style="color:#666;">
            Si vous n'avez pas demandé cette action, ignorez simplement cet email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};