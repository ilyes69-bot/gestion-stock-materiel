const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const supabase = require("../config/supabase");
const parseSupabaseDate = (value) => {
  if (!value) return new Date(0);

  const dateString = String(value);

  if (dateString.endsWith("Z") || dateString.includes("+")) {
    return new Date(dateString);
  }

  return new Date(`${dateString}Z`);
};
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("./email.service");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


const registerUser = async ({ nom, prenom, email, password }) => {
  if (!nom || !prenom || !email || !password) {
    const error = new Error("Tous les champs sont obligatoires");
    error.status = 400;
    throw error;
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    const error = new Error("Cet email est déjà utilisé");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert([
      {
        nom,
        prenom,
        email,
        password: hashedPassword,
        role: "client",
        statut_compte: "actif",
        email_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
      },
    ])
    .select("id, nom, prenom, email, role, email_verified")
    .single();

  if (insertError) {
    const error = new Error("Erreur lors de la création du compte");
    error.status = 500;
    throw error;
  }

  await sendVerificationEmail(
    email,
    `${prenom} ${nom}`,
    verificationToken
  );

  return {
    message:
      "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
    user,
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email et mot de passe obligatoires");
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (userError || !user) {
    const error = new Error("Email ou mot de passe incorrect");
    error.status = 400;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Email ou mot de passe incorrect");
    error.status = 400;
    throw error;
  }

  if (!user.email_verified) {
    const error = new Error(
      "Votre compte n'est pas encore confirmé. Veuillez vérifier votre email."
    );
    error.status = 403;
    throw error;
  }

  if (user.statut_compte === "bloque") {
    const reason = user.ban_reason || "Aucune raison précisée";

    const error = new Error(
      `Votre compte est bloqué. Raison : ${reason}`
    );
    error.status = 403;
    throw error;
  }

  if (user.statut_compte !== "actif") {
    const error = new Error("Votre compte n'est pas actif");
    error.status = 403;
    throw error;
  }

  const token = generateToken(user);

  delete user.password;
  delete user.verification_token;
  delete user.verification_expires;

  return {
    message: "Connexion réussie",
    token,
    user,
  };
};

const getCurrentUser = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, nom, prenom, email, role, statut_compte, email_verified")
    .eq("id", userId)
    .single();

  if (error || !user) {
    const err = new Error("Utilisateur introuvable");
    err.status = 404;
    throw err;
  }

  return user;
};

const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error("Token de vérification manquant");
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, verification_expires")
    .eq("verification_token", token)
    .single();

  if (userError || !user) {
    const error = new Error("Lien de vérification invalide");
    error.status = 400;
    throw error;
  }

  const now = new Date();
  const expiresAt = new Date(user.verification_expires);

  if (expiresAt < now) {
    const error = new Error("Lien de vérification expiré");
    error.status = 400;
    throw error;
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      email_verified: true,
      verification_token: null,
      verification_expires: null,
    })
    .eq("id", user.id);

  if (updateError) {
    const error = new Error("Erreur lors de la vérification du compte");
    error.status = 500;
    throw error;
  }

  return {
    message: "Email vérifié avec succès",
  };
};
const requestPasswordReset = async ({ email }) => {
  if (!email) {
    const error = new Error("Email obligatoire");
    error.status = 400;
    throw error;
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, nom, prenom, email")
    .eq("email", email)
    .maybeSingle();

  const genericMessage =
    "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.";

  if (!user) {
    return {
      message: genericMessage,
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("users")
    .update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpires,
    })
    .eq("id", user.id);

  if (updateError) {
    const error = new Error("Erreur lors de la demande de réinitialisation");
    error.status = 500;
    throw error;
  }

  await sendResetPasswordEmail(
    user.email,
    `${user.prenom} ${user.nom}`,
    resetToken
  );

  return {
    message: genericMessage,
  };
};

const resetPassword = async (token, { password }) => {
  if (!token) {
    const error = new Error("Token manquant");
    error.status = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Nouveau mot de passe obligatoire");
    error.status = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Le mot de passe doit contenir au moins 6 caractères");
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, reset_password_expires")
    .eq("reset_password_token", token)
    .single();

  if (userError || !user) {
    const error = new Error("Lien de réinitialisation invalide");
    error.status = 400;
    throw error;
  }

  const now = new Date();
const expiresAt = parseSupabaseDate(user.reset_password_expires);

console.log("NOW :", now.toISOString());
console.log("RESET EXPIRES :", expiresAt.toISOString());

if (expiresAt.getTime() < now.getTime()) {
  const error = new Error("Lien de réinitialisation expiré");
  error.status = 400;
  throw error;
}

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
      email_verified: true,
    })
    .eq("id", user.id);

  if (updateError) {
    const error = new Error("Erreur lors de la modification du mot de passe");
    error.status = 500;
    throw error;
  }

  return {
    message: "Mot de passe modifié avec succès. Vous pouvez vous connecter.",
  };
};
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};