const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

const getAdminSocieteId = async (adminId) => {
  const { data: admin, error } = await supabase
    .from("users")
    .select("id, role, societe_id")
    .eq("id", adminId)
    .single();

  if (error || !admin) {
    const err = new Error("Admin introuvable");
    err.status = 404;
    throw err;
  }

  if (admin.role !== "admin" || !admin.societe_id) {
    const err = new Error("Vous n'êtes pas rattaché à une société");
    err.status = 403;
    throw err;
  }

  return admin.societe_id;
};

const getTravailleursSociete = async (adminId) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data, error } = await supabase
    .from("users")
    .select("id, nom, prenom, email, role, statut_compte, societe_id, date_inscription")
    .eq("role", "travailleur")
    .eq("societe_id", societeId)
    .order("date_inscription", { ascending: false });

  if (error) {
    console.log("Erreur getTravailleursSociete:", error);

    const err = new Error("Erreur lors du chargement des travailleurs");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const createTravailleurSociete = async (adminId, data) => {
  const societeId = await getAdminSocieteId(adminId);

  const { nom, prenom, email, password } = data;

  if (!nom || !prenom || !email || !password) {
    const err = new Error("Nom, prénom, email et mot de passe sont obligatoires");
    err.status = 400;
    throw err;
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existingUser) {
    const err = new Error("Un utilisateur existe déjà avec cet email");
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: travailleur, error } = await supabase
    .from("users")
    .insert({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "travailleur",
      statut_compte: "actif",
      email_verified: true,
      societe_id: societeId,
    })
    .select("id, nom, prenom, email, role, statut_compte, societe_id, date_inscription")
    .single();

  if (error) {
    console.log("Erreur createTravailleurSociete:", error);

    const err = new Error("Erreur lors de la création du travailleur");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    type_action: "CREATION_TRAVAILLEUR_SOCIETE",
    description: `L'admin société a créé le travailleur ${travailleur.prenom} ${travailleur.nom}.`,
  });

  return travailleur;
};

const bloquerTravailleurSociete = async (adminId, travailleurId, reason) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data: travailleur, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("id", travailleurId)
    .eq("role", "travailleur")
    .eq("societe_id", societeId)
    .single();

  if (findError || !travailleur) {
    const err = new Error("Travailleur introuvable dans votre société");
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "bloque",
      ban_reason: reason || "Compte bloqué par l'admin société",
      banned_at: new Date().toISOString(),
    })
    .eq("id", travailleurId)
    .select("id, nom, prenom, email, role, statut_compte, societe_id")
    .single();

  if (error) {
    console.log("Erreur bloquerTravailleurSociete:", error);

    const err = new Error("Erreur lors du blocage du travailleur");
    err.status = 500;
    throw err;
  }

  return data;
};

const debloquerTravailleurSociete = async (adminId, travailleurId) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data: travailleur, error: findError } = await supabase
    .from("users")
    .select("*")
    .eq("id", travailleurId)
    .eq("role", "travailleur")
    .eq("societe_id", societeId)
    .single();

  if (findError || !travailleur) {
    const err = new Error("Travailleur introuvable dans votre société");
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      statut_compte: "actif",
      ban_reason: null,
      banned_at: null,
    })
    .eq("id", travailleurId)
    .select("id, nom, prenom, email, role, statut_compte, societe_id")
    .single();

  if (error) {
    console.log("Erreur debloquerTravailleurSociete:", error);

    const err = new Error("Erreur lors du déblocage du travailleur");
    err.status = 500;
    throw err;
  }

  return data;
};

module.exports = {
  getTravailleursSociete,
  createTravailleurSociete,
  bloquerTravailleurSociete,
  debloquerTravailleurSociete,
};