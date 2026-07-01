const supabase = require("../config/supabase");

const verifierDates = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) {
    const error = new Error("Les dates de début et de fin sont obligatoires");
    error.status = 400;
    throw error;
  }

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  debut.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  if (debut < today) {
    const error = new Error("La date de début ne peut pas être dans le passé");
    error.status = 400;
    throw error;
  }

  if (fin < debut) {
    const error = new Error("La date de fin doit être après la date de début");
    error.status = 400;
    throw error;
  }
};

const createEmprunt = async (clientId, data) => {
  const materielId = data.materiel_id || data.materielId;
  const dateDebut = data.date_debut || data.dateDebut;
  const dateFin = data.date_fin || data.dateFin;

  verifierDates(dateDebut, dateFin);

  if (!materielId) {
    const error = new Error("Le matériel est obligatoire");
    error.status = 400;
    throw error;
  }

  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", materielId)
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

  let typeEmprunt = "SOCIETE";
  let statutEmprunt = "EN_ATTENTE_VALIDATION";
  let proprietaireUserId = null;

  if (materiel.proprietaire_type === "UTILISATEUR") {
    if (materiel.statut_validation !== "APPROUVE") {
      const error = new Error("Ce matériel n'est pas encore approuvé");
      error.status = 400;
      throw error;
    }

    if (materiel.owner_user_id === clientId) {
      const error = new Error("Vous ne pouvez pas emprunter votre propre matériel");
      error.status = 400;
      throw error;
    }

    typeEmprunt = "UTILISATEUR";
    statutEmprunt = "EN_ATTENTE_PROPRIETAIRE";
    proprietaireUserId = materiel.owner_user_id;
  }

  const { data: emprunt, error } = await supabase
    .from("emprunts")
    .insert({
      client_id: clientId,
      materiel_id: materielId,
      date_debut: dateDebut,
      date_fin: dateFin,
      statut: statutEmprunt,
      type_emprunt: typeEmprunt,
      proprietaire_user_id: proprietaireUserId,
    })
    .select()
    .single();

  if (error) {
    console.log("Erreur createEmprunt:", error);

    const err = new Error("Erreur lors de la création de la demande d'emprunt");
    err.status = 500;
    throw err;
  }

  if (typeEmprunt === "SOCIETE") {
    await supabase.from("materiels").update({
      statut: "RESERVE",
      updated_at: new Date().toISOString(),
    }).eq("id", materielId);
  }

  await supabase.from("historique_actions").insert({
    user_id: clientId,
    materiel_id: materielId,
    emprunt_id: emprunt.id,
    type_action: "CREATION_EMPRUNT",
    description:
      typeEmprunt === "UTILISATEUR"
        ? `Le client a demandé à emprunter le matériel utilisateur ${materiel.nom}.`
        : `Le client a demandé à emprunter le matériel société ${materiel.nom}.`,
  });

  if (typeEmprunt === "UTILISATEUR" && proprietaireUserId) {
    await supabase.from("notifications").insert({
      user_id: proprietaireUserId,
      contenu: `Vous avez reçu une demande d'emprunt pour votre matériel "${materiel.nom}".`,
      type: "DEMANDE_MATERIEL_UTILISATEUR",
    });
  }

  return emprunt;
};

const getEmpruntsByClient = async (clientId) => {
  const { data: emprunts, error } = await supabase
    .from("emprunts")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getEmpruntsByClient emprunts:", error);
    const err = new Error("Erreur lors du chargement de vos emprunts");
    err.status = 500;
    throw err;
  }

  if (!emprunts || emprunts.length === 0) {
    return [];
  }

  const materielIds = emprunts.map((e) => e.materiel_id);

  const { data: materiels, error: materielsError } = await supabase
    .from("materiels")
    .select("*")
    .in("id", materielIds);

  if (materielsError) {
    console.log("Erreur getEmpruntsByClient materiels:", materielsError);
    const err = new Error("Erreur lors du chargement des matériels");
    err.status = 500;
    throw err;
  }

  const materielsMap = {};
  materiels.forEach((materiel) => {
    materielsMap[materiel.id] = materiel;
  });

  return emprunts.map((emprunt) => ({
    ...emprunt,
    materiel: materielsMap[emprunt.materiel_id] || null,
  }));
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
      materiel:materiels (
        id,
        nom,
        description,
        categorie,
        statut,
        etat,
        image_url,
        proprietaire_type,
        owner_user_id,
        prix_jour,
        ville
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getAllEmprunts:", error);

    const err = new Error("Erreur lors du chargement des emprunts");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const validerDemandeEmprunt = async (adminId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`
      *,
      materiel:materiels (*)
    `)
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.type_emprunt === "UTILISATEUR") {
    const error = new Error("Cet emprunt doit être validé par le propriétaire du matériel");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "VALIDE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur validerDemandeEmprunt:", error);

    const err = new Error("Erreur lors de la validation de la demande");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "VALIDATION_DEMANDE_EMPRUNT",
    description: "L'admin société a validé la demande d'emprunt.",
  });

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: "Votre demande d'emprunt a été validée.",
    type: "EMPRUNT_VALIDE",
  });

  return data;
};

const refuserDemandeEmprunt = async (adminId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.type_emprunt === "UTILISATEUR") {
    const error = new Error("Cet emprunt doit être refusé par le propriétaire du matériel");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "REFUSE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur refuserDemandeEmprunt:", error);

    const err = new Error("Erreur lors du refus de la demande");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "DISPONIBLE",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "REFUS_DEMANDE_EMPRUNT",
    description: "L'admin société a refusé la demande d'emprunt.",
  });

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: "Votre demande d'emprunt a été refusée.",
    type: "EMPRUNT_REFUSE",
  });

  return data;
};

const confirmerRetourNormalFinal = async (adminId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: new Date().toISOString(),
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerRetourNormalFinal:", error);

    const err = new Error("Erreur lors de la confirmation du retour");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "CONFIRMATION_RETOUR_NORMAL",
    description: "L'admin a confirmé le retour normal du matériel.",
  });

  return data;
};

const confirmerRetourEndommageFinal = async (adminId, empruntId, dataRetour = {}) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  const { type_probleme_retour, commentaire_retour } = dataRetour;

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: new Date().toISOString(),
      probleme_retour: true,
      type_probleme_retour: type_probleme_retour || "ENDOMMAGE",
      commentaire_retour: commentaire_retour || "Matériel retourné avec problème.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerRetourEndommageFinal:", error);

    const err = new Error("Erreur lors de la confirmation du retour endommagé");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "INDISPONIBLE",
    etat: "ENDOMMAGE",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "CONFIRMATION_RETOUR_ENDOMMAGE",
    description: "L'admin a confirmé un retour avec problème.",
  });

  return data;
};

module.exports = {
  createEmprunt,
  getEmpruntsByClient,
  getAllEmprunts,
  validerDemandeEmprunt,
  refuserDemandeEmprunt,
  confirmerRetourNormalFinal,
  confirmerRetourEndommageFinal,

  // Compatibilité avec anciens noms si ton controller les utilise encore
  validateReturn: confirmerRetourNormalFinal,
  markAsDamaged: confirmerRetourEndommageFinal,
  validerRetour: confirmerRetourNormalFinal,
  signalerEndommage: confirmerRetourEndommageFinal,
};