const supabase = require("../config/supabase");

const getAllUsers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, nom, prenom, email, role, statut_compte, email_verified, ban_reason, banned_at, date_inscription"
    )
    .order("date_inscription", { ascending: false });

  if (error) {
    const err = new Error("Erreur lors du chargement des utilisateurs");
    err.status = 500;
    throw err;
  }

  return data;
};

const blockUser = async (userId, reason, adminId) => {
  if (!reason || reason.trim() === "") {
    const error = new Error("La raison du blocage est obligatoire");
    error.status = 400;
    throw error;
  }

  if (userId === adminId) {
    const error = new Error("Vous ne pouvez pas bloquer votre propre compte");
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    const error = new Error("Utilisateur introuvable");
    error.status = 404;
    throw error;
  }

  if (user.role === "admin") {
    const error = new Error("Vous ne pouvez pas bloquer un administrateur");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "bloque",
      ban_reason: reason,
      banned_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(
      "id, nom, prenom, email, role, statut_compte, email_verified, ban_reason, banned_at, date_inscription"
    )
    .single();

  if (error) {
    const err = new Error("Erreur lors du blocage de l'utilisateur");
    err.status = 500;
    throw err;
  }

  return data;
};

const unblockUser = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "actif",
      ban_reason: null,
      banned_at: null,
    })
    .eq("id", userId)
    .select(
      "id, nom, prenom, email, role, statut_compte, email_verified, ban_reason, banned_at, date_inscription"
    )
    .single();

  if (error) {
    const err = new Error("Erreur lors du déblocage de l'utilisateur");
    err.status = 500;
    throw err;
  }

  return data;
};

module.exports = {
  getAllUsers,
  blockUser,
  unblockUser,
};