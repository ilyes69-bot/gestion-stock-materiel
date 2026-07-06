const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

const demanderCreationSociete = async (userId, data) => {
  const { nom, email, telephone, adresse, description } = data;

  if (!nom || nom.trim() === "") {
    const error = new Error("Le nom de la société est obligatoire");
    error.status = 400;
    throw error;
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    const error = new Error("Utilisateur introuvable");
    error.status = 404;
    throw error;
  }

  if (user.role !== "client") {
    const error = new Error("Seul un client peut demander la création d'une société");
    error.status = 400;
    throw error;
  }

  const { data: existing, error: existingError } = await supabase
    .from("societes")
    .select("*")
    .eq("demandeur_id", userId)
    .in("statut", ["EN_ATTENTE", "APPROUVE"]);

  if (existingError) {
    console.log("Erreur verification societe existante:", existingError);
  }

  if (existing && existing.length > 0) {
    const error = new Error("Vous avez déjà une demande de société en cours ou approuvée");
    error.status = 400;
    throw error;
  }

  const { data: societe, error } = await supabase
    .from("societes")
    .insert({
      nom: nom.trim(),
      email: email || user.email,
      telephone: telephone || "",
      adresse: adresse || "",
      description: description || "",
      demandeur_id: userId,
      statut: "EN_ATTENTE",
      commentaire_validation: null,
    })
    .select()
    .single();

  if (error) {
    console.log("Erreur demanderCreationSociete:", error);

    const err = new Error("Erreur lors de la demande de création de société");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: userId,
    type_action: "DEMANDE_CREATION_SOCIETE",
    description: `L'utilisateur a demandé la création de la société ${societe.nom}.`,
  });

  return societe;
};

const getToutesSocietes = async () => {
  const { data, error } = await supabase
    .from("societes")
    .select(`
      *,
      demandeur:users!societes_demandeur_id_fkey (
        id,
        nom,
        prenom,
        email,
        role
      ),
      admin:users!societes_admin_id_fkey (
        id,
        nom,
        prenom,
        email,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getToutesSocietes:", error);

    const err = new Error("Erreur lors du chargement des sociétés");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const getSocietesEnAttente = async () => {
  const { data, error } = await supabase
    .from("societes")
    .select(`
      *,
      demandeur:users!societes_demandeur_id_fkey (
        id,
        nom,
        prenom,
        email,
        role
      )
    `)
    .eq("statut", "EN_ATTENTE")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getSocietesEnAttente:", error);

    const err = new Error("Erreur lors du chargement des demandes de sociétés");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const approuverSociete = async (superAdminId, societeId) => {
  const { data: societe, error: societeError } = await supabase
    .from("societes")
    .select("*")
    .eq("id", societeId)
    .single();

  if (societeError || !societe) {
    const error = new Error("Société introuvable");
    error.status = 404;
    throw error;
  }

  if (societe.statut !== "EN_ATTENTE") {
    const error = new Error("Cette société a déjà été traitée");
    error.status = 400;
    throw error;
  }

  if (!societe.demandeur_id) {
    const error = new Error("Aucun demandeur associé à cette société");
    error.status = 400;
    throw error;
  }

  const { data: updatedSociete, error } = await supabase
    .from("societes")
    .update({
      statut: "APPROUVE",
      admin_id: societe.demandeur_id,
      commentaire_validation: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", societeId)
    .select()
    .single();

  if (error) {
    console.log("Erreur approuverSociete:", error);

    const err = new Error("Erreur lors de l'approbation de la société");
    err.status = 500;
    throw err;
  }

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      role: "admin",
      societe_id: societeId,
    })
    .eq("id", societe.demandeur_id);

  if (userUpdateError) {
    console.log("Erreur update user admin societe:", userUpdateError);

    const err = new Error("La société est approuvée mais l'utilisateur n'a pas été mis à jour");
    err.status = 500;
    throw err;
  }

  await supabase.from("notifications").insert({
    user_id: societe.demandeur_id,
    contenu: `Votre société "${societe.nom}" a été approuvée. Vous êtes maintenant admin société.`,
    type: "SOCIETE_APPROUVEE",
  });

  await supabase.from("historique_actions").insert({
    user_id: superAdminId,
    type_action: "APPROBATION_SOCIETE",
    description: `Le super admin a approuvé la société ${societe.nom}.`,
  });

  return updatedSociete;
};

const refuserSociete = async (superAdminId, societeId, commentaire) => {
  const motif =
    commentaire && commentaire.trim() !== ""
      ? commentaire.trim()
      : "Votre demande de société a été refusée.";

  const { data: societe, error: societeError } = await supabase
    .from("societes")
    .select("*")
    .eq("id", societeId)
    .single();

  if (societeError || !societe) {
    const error = new Error("Société introuvable");
    error.status = 404;
    throw error;
  }

  if (societe.statut !== "EN_ATTENTE") {
    const error = new Error("Cette société a déjà été traitée");
    error.status = 400;
    throw error;
  }

  const { data: updatedSociete, error } = await supabase
    .from("societes")
    .update({
      statut: "REFUSE",
      commentaire_validation: motif,
      updated_at: new Date().toISOString(),
    })
    .eq("id", societeId)
    .select()
    .single();

  if (error) {
    console.log("Erreur refuserSociete:", error);

    const err = new Error("Erreur lors du refus de la société");
    err.status = 500;
    throw err;
  }

  if (societe.demandeur_id) {
    await supabase.from("notifications").insert({
      user_id: societe.demandeur_id,
      contenu: `Votre demande de société "${societe.nom}" a été refusée. Raison : ${motif}`,
      type: "SOCIETE_REFUSEE",
    });
  }

  await supabase.from("historique_actions").insert({
    user_id: superAdminId,
    type_action: "REFUS_SOCIETE",
    description: `Le super admin a refusé la société ${societe.nom}.`,
  });

  return updatedSociete;
};
const demanderSocietePublique = async (data) => {
  const {
    nom,
    prenom,
    email,
    password,
    societe_nom,
    telephone,
    adresse,
    description,
  } = data;

  if (!nom || !prenom || !email || !password || !societe_nom) {
    const error = new Error(
      "Nom, prénom, email, mot de passe et nom de société sont obligatoires"
    );
    error.status = 400;
    throw error;
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingUser) {
    const error = new Error("Un compte existe déjà avec cet email");
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "client",
      statut_compte: "actif",
      email_verified: true,
    })
    .select()
    .single();

  if (userError) {
    console.log("Erreur creation user societe publique:", userError);

    const error = new Error("Erreur lors de la création du compte");
    error.status = 500;
    throw error;
  }

  const { data: societe, error: societeError } = await supabase
    .from("societes")
    .insert({
      nom: societe_nom.trim(),
      email: email.trim().toLowerCase(),
      telephone: telephone || "",
      adresse: adresse || "",
      description: description || "",
      demandeur_id: user.id,
      statut: "EN_ATTENTE",
      commentaire_validation: null,
    })
    .select()
    .single();

  if (societeError) {
    console.log("Erreur creation societe publique:", societeError);

    const error = new Error("Compte créé, mais erreur lors de la demande société");
    error.status = 500;
    throw error;
  }

  await supabase.from("historique_actions").insert({
    user_id: user.id,
    type_action: "DEMANDE_CREATION_SOCIETE_PUBLIQUE",
    description: `Demande publique de création de la société ${societe.nom}.`,
  });

  return {
    user,
    societe,
  };
};

module.exports = {
  demanderCreationSociete,
  getToutesSocietes,
  getSocietesEnAttente,
  approuverSociete,
  refuserSociete,
demanderSocietePublique,
};