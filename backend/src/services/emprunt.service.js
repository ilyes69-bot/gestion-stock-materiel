const supabase = require("../config/supabase");

const todayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const checkDates = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) {
    const error = new Error("Les dates sont obligatoires");
    error.status = 400;
    throw error;
  }

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (fin < debut) {
    const error = new Error("La date de fin doit être supérieure ou égale à la date de début");
    error.status = 400;
    throw error;
  }
};

const createEmprunt = async (clientId, empruntData) => {
  const { materiel_id, date_debut, date_fin } = empruntData;

  checkDates(date_debut, date_fin);

  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", materiel_id)
    .single();

  if (materielError || !materiel) {
    const error = new Error("Matériel introuvable");
    error.status = 404;
    throw error;
  }

  if (materiel.statut !== "DISPONIBLE") {
    const error = new Error("Ce matériel n'est pas disponible");
    error.status = 400;
    throw error;
  }

  if (materiel.etat !== "BON_ETAT") {
    const error = new Error("Ce matériel n'est pas en bon état");
    error.status = 400;
    throw error;
  }

  const activeStatuses = [
    "EN_ATTENTE_VALIDATION",
    "VALIDE",
    "EN_COURS",
    "EN_ATTENTE_CONFIRMATION_RETOUR",
  ];

  const { data: empruntActif, error: activeError } = await supabase
    .from("emprunts")
    .select("id, statut")
    .eq("materiel_id", materiel_id)
    .in("statut", activeStatuses)
    .limit(1)
    .maybeSingle();

  if (activeError) {
    const error = new Error("Erreur lors de la vérification des emprunts actifs");
    error.status = 500;
    throw error;
  }

  if (empruntActif) {
    const error = new Error(
      "Ce matériel possède déjà une demande ou un emprunt actif"
    );
    error.status = 400;
    throw error;
  }

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .insert({
      client_id: clientId,
      materiel_id,
      date_debut,
      date_fin,
      statut: "EN_ATTENTE_VALIDATION",
      sortie_confirmee: false,
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
    })
    .select()
    .single();

  if (empruntError) {
    const error = new Error("Erreur lors de la création de la demande d'emprunt");
    error.status = 500;
    throw error;
  }

  await supabase.from("notifications").insert({
    user_id: clientId,
    contenu: `Votre demande d'emprunt pour le matériel ${materiel.nom} a été envoyée. Elle est en attente de validation par l'administrateur.`,
    type: "DEMANDE_EMPRUNT",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: clientId,
    materiel_id,
    emprunt_id: emprunt.id,
    type_action: "DEMANDE_EMPRUNT",
    description: `Demande d'emprunt créée pour le matériel ${materiel.nom}.`,
  });

  return emprunt;
};

const getMesEmprunts = async (clientId) => {
  const { data, error } = await supabase
    .from("emprunts")
    .select(`
      *,
      materiels (
        id,
        nom,
        description,
        categorie,
        statut,
        etat,
        image_url
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error("Erreur lors du chargement de vos emprunts");
    err.status = 500;
    throw err;
  }

  return data;
};

const getAllEmprunts = async () => {
  const { data, error } = await supabase
    .from("emprunts")
    .select(`
      *,
      client:users!emprunts_client_id_fkey (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom,
        description,
        categorie,
        statut,
        etat,
        image_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error("Erreur lors du chargement des emprunts");
    err.status = 500;
    throw err;
  }

  return data;
};

const validateReturn = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      users (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut === "RETOURNE") {
    const error = new Error("Cet emprunt est déjà retourné");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: todayDate(),
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors de la validation du retour");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "DISPONIBLE",
      etat: "BON_ETAT",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été validé.`,
    type: "RETOUR",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "VALIDATION_RETOUR",
    description: `Retour validé pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const markAsDamaged = async (empruntId, data, adminId) => {
  const { type_probleme_retour, commentaire_retour } = data;

  if (!commentaire_retour || commentaire_retour.trim() === "") {
    const error = new Error("Le commentaire du problème est obligatoire");
    error.status = 400;
    throw error;
  }

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      users (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut === "RETOURNE") {
    const error = new Error("Cet emprunt est déjà retourné");
    error.status = 400;
    throw error;
  }

  const typeProbleme = type_probleme_retour || "Matériel endommagé";

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: todayDate(),
      probleme_retour: true,
      type_probleme_retour: typeProbleme,
      commentaire_retour: commentaire_retour.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors du signalement du matériel endommagé");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "ENDOMMAGE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le matériel ${emprunt.materiels?.nom || ""} a été signalé comme endommagé. Commentaire : ${commentaire_retour.trim()}`,
    type: "MATERIEL_ENDOMMAGE",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "RETOUR_AVEC_PROBLEME",
    description: `Retour avec problème pour le matériel ${emprunt.materiels?.nom || ""}. Type : ${typeProbleme}. Commentaire : ${commentaire_retour.trim()}`,
  });

  return updatedEmprunt;
};
const validerDemandeEmprunt = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      client:users!emprunts_client_id_fkey (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom,
        statut,
        etat
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Demande d'emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_VALIDATION") {
    const error = new Error("Cette demande ne peut pas être validée");
    error.status = 400;
    throw error;
  }

  if (
    emprunt.materiels?.statut !== "DISPONIBLE" ||
    emprunt.materiels?.etat !== "BON_ETAT"
  ) {
    const error = new Error("Le matériel n'est plus disponible ou n'est pas en bon état");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "VALIDE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors de la validation de la demande");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "RESERVE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Votre demande d'emprunt pour le matériel ${emprunt.materiels?.nom || ""} a été validée.`,
    type: "DEMANDE_VALIDEE",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "VALIDATION_DEMANDE_EMPRUNT",
    description: `Demande d'emprunt validée pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const refuserDemandeEmprunt = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      client:users!emprunts_client_id_fkey (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Demande d'emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_VALIDATION") {
    const error = new Error("Cette demande ne peut pas être refusée");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "REFUSE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors du refus de la demande");
    error.status = 500;
    throw error;
  }

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Votre demande d'emprunt pour le matériel ${emprunt.materiels?.nom || ""} a été refusée.`,
    type: "DEMANDE_REFUSEE",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "REFUS_DEMANDE_EMPRUNT",
    description: `Demande d'emprunt refusée pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const confirmerRetourNormalFinal = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      client:users!emprunts_client_id_fkey (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_CONFIRMATION_RETOUR") {
    const error = new Error("Le retour de cet emprunt n'est pas en attente de confirmation");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors de la confirmation du retour");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "DISPONIBLE",
      etat: "BON_ETAT",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été confirmé en bon état.`,
    type: "RETOUR_CONFIRME",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "CONFIRMATION_RETOUR_NORMAL",
    description: `Retour final confirmé en bon état pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const confirmerRetourEndommageFinal = async (empruntId, data, adminId) => {
  const { type_probleme_retour, commentaire_retour } = data || {};

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      client:users!emprunts_client_id_fkey (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom
      )
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_CONFIRMATION_RETOUR") {
    const error = new Error("Le retour de cet emprunt n'est pas en attente de confirmation");
    error.status = 400;
    throw error;
  }

  const finalComment =
    commentaire_retour?.trim() || emprunt.commentaire_retour?.trim();

  if (!finalComment) {
    const error = new Error("Le commentaire du problème est obligatoire");
    error.status = 400;
    throw error;
  }

  const finalType =
    type_probleme_retour || emprunt.type_probleme_retour || "Matériel endommagé";

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      probleme_retour: true,
      type_probleme_retour: finalType,
      commentaire_retour: finalComment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors de la confirmation du retour endommagé");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "ENDOMMAGE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été confirmé avec un problème. Commentaire : ${finalComment}`,
    type: "RETOUR_ENDOMMAGE_CONFIRME",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "CONFIRMATION_RETOUR_ENDOMMAGE",
    description: `Retour final confirmé comme endommagé pour le matériel ${emprunt.materiels?.nom || ""}. Type : ${finalType}. Commentaire : ${finalComment}`,
  });

  return updatedEmprunt;
};

module.exports = {
  createEmprunt,
  getMesEmprunts,
  getAllEmprunts,
  validateReturn,
  markAsDamaged,
  validerDemandeEmprunt,
  refuserDemandeEmprunt,
  confirmerRetourNormalFinal,
  confirmerRetourEndommageFinal,
};