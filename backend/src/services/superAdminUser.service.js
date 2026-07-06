const supabase = require("../config/supabase");

const getAllUsersForSuperAdmin = async () => {
  const { data: users, error } = await supabase
    .from("users")
    .select(
      "id, nom, prenom, email, role, statut_compte, email_verified, societe_id, date_inscription, banned_at, ban_reason"
    )
    .order("date_inscription", { ascending: false });

  if (error) {
    console.log("Erreur getAllUsersForSuperAdmin:", error);

    const err = new Error("Erreur lors du chargement des utilisateurs");
    err.status = 500;
    throw err;
  }

  if (!users || users.length === 0) {
    return [];
  }

  const societeIds = [
    ...new Set(users.map((user) => user.societe_id).filter(Boolean)),
  ];

  let societes = [];

  if (societeIds.length > 0) {
    const { data: societesData, error: societesError } = await supabase
      .from("societes")
      .select("id, nom, statut")
      .in("id", societeIds);

    if (societesError) {
      console.log("Erreur chargement sociétés utilisateurs:", societesError);
    } else {
      societes = societesData || [];
    }
  }

  const societesMap = new Map(
    societes.map((societe) => [societe.id, societe])
  );

  return users.map((user) => ({
    ...user,
    societe: user.societe_id ? societesMap.get(user.societe_id) || null : null,
  }));
};

const bloquerUtilisateur = async (userId, raison = "") => {
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

  if (user.role === "super_admin") {
    const error = new Error("Impossible de bloquer un super admin");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "BLOQUE",
      ban_reason: raison || "Utilisateur bloqué par le super admin",
      banned_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, nom, prenom, email, role, statut_compte, ban_reason, banned_at")
    .single();

  if (error) {
    console.log("Erreur bloquerUtilisateur:", error);

    const err = new Error("Erreur lors du blocage de l'utilisateur");
    err.status = 500;
    throw err;
  }

  return data;
};

const debloquerUtilisateur = async (userId) => {
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

  if (user.role === "super_admin") {
    const error = new Error("Impossible de modifier un super admin");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "ACTIF",
      ban_reason: null,
      banned_at: null,
    })
    .eq("id", userId)
    .select("id, nom, prenom, email, role, statut_compte")
    .single();

  if (error) {
    console.log("Erreur debloquerUtilisateur:", error);

    const err = new Error("Erreur lors du déblocage de l'utilisateur");
    err.status = 500;
    throw err;
  }

  return data;
};

module.exports = {
  getAllUsersForSuperAdmin,
  bloquerUtilisateur,
  debloquerUtilisateur,
};