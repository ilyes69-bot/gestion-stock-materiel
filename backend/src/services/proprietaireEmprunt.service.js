const supabase = require("../config/supabase");

const getDemandesRecues = async (proprietaireId) => {
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
        image_url,
        prix_jour,
        ville,
        statut,
        etat
      )
    `)
    .eq("type_emprunt", "UTILISATEUR")
    .eq("proprietaire_user_id", proprietaireId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getDemandesRecues:", error);
    const err = new Error("Erreur lors du chargement des demandes reçues");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const accepterDemandeUtilisateur = async (proprietaireId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`*, materiel:materiels (*)`)
    .eq("id", empruntId)
    .eq("proprietaire_user_id", proprietaireId)
    .eq("type_emprunt", "UTILISATEUR")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Demande introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_PROPRIETAIRE") {
    const error = new Error("Cette demande ne peut plus être acceptée");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "VALIDE_PROPRIETAIRE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur accepterDemandeUtilisateur:", error);
    const err = new Error("Erreur lors de l'acceptation de la demande");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "RESERVE",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Votre demande pour "${emprunt.materiel.nom}" a été acceptée par le propriétaire.`,
    type: "DEMANDE_UTILISATEUR_ACCEPTEE",
  });

  await supabase.from("historique_actions").insert({
    user_id: proprietaireId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "ACCEPTATION_DEMANDE_UTILISATEUR",
    description: `Le propriétaire a accepté la demande pour ${emprunt.materiel.nom}.`,
  });

  return data;
};

const refuserDemandeUtilisateur = async (proprietaireId, empruntId, commentaire) => {
  const motif =
    commentaire && commentaire.trim() !== ""
      ? commentaire.trim()
      : "Demande refusée par le propriétaire.";

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`*, materiel:materiels (*)`)
    .eq("id", empruntId)
    .eq("proprietaire_user_id", proprietaireId)
    .eq("type_emprunt", "UTILISATEUR")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Demande introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_ATTENTE_PROPRIETAIRE") {
    const error = new Error("Cette demande ne peut plus être refusée");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "REFUSE",
      commentaire_refus_proprietaire: motif,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur refuserDemandeUtilisateur:", error);
    const err = new Error("Erreur lors du refus de la demande");
    err.status = 500;
    throw err;
  }

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Votre demande pour "${emprunt.materiel.nom}" a été refusée. Raison : ${motif}`,
    type: "DEMANDE_UTILISATEUR_REFUSEE",
  });

  await supabase.from("historique_actions").insert({
    user_id: proprietaireId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "REFUS_DEMANDE_UTILISATEUR",
    description: `Le propriétaire a refusé la demande pour ${emprunt.materiel.nom}.`,
  });

  return data;
};

const confirmerRemiseUtilisateur = async (proprietaireId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`*, materiel:materiels (*)`)
    .eq("id", empruntId)
    .eq("proprietaire_user_id", proprietaireId)
    .eq("type_emprunt", "UTILISATEUR")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Demande introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "VALIDE_PROPRIETAIRE") {
    const error = new Error("La remise ne peut être confirmée que pour une demande acceptée");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_COURS",
      sortie_confirmee: true,
      date_sortie_effective: new Date().toISOString(),
      sortie_par: proprietaireId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerRemiseUtilisateur:", error);
    const err = new Error("Erreur lors de la confirmation de remise");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "EMPRUNTE",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `La remise du matériel "${emprunt.materiel.nom}" a été confirmée.`,
    type: "REMISE_MATERIEL_UTILISATEUR",
  });

  await supabase.from("historique_actions").insert({
    user_id: proprietaireId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "REMISE_MATERIEL_UTILISATEUR",
    description: `Le propriétaire a confirmé la remise du matériel ${emprunt.materiel.nom}.`,
  });

  return data;
};

const confirmerRetourNormalUtilisateur = async (proprietaireId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`*, materiel:materiels (*)`)
    .eq("id", empruntId)
    .eq("proprietaire_user_id", proprietaireId)
    .eq("type_emprunt", "UTILISATEUR")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour ne peut être confirmé que pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: new Date().toISOString(),
      retour_par: proprietaireId,
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerRetourNormalUtilisateur:", error);
    const err = new Error("Erreur lors de la confirmation du retour");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel "${emprunt.materiel.nom}" a été confirmé comme normal.`,
    type: "RETOUR_MATERIEL_UTILISATEUR",
  });

  return data;
};

const confirmerRetourProblemeUtilisateur = async (
  proprietaireId,
  empruntId,
  retourData = {}
) => {
  const { type_probleme_retour, commentaire_retour } = retourData;

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select(`*, materiel:materiels (*)`)
    .eq("id", empruntId)
    .eq("proprietaire_user_id", proprietaireId)
    .eq("type_emprunt", "UTILISATEUR")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour ne peut être confirmé que pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: new Date().toISOString(),
      retour_par: proprietaireId,
      probleme_retour: true,
      type_probleme_retour: type_probleme_retour || "ENDOMMAGE",
      commentaire_retour: commentaire_retour || "Matériel retourné avec problème.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerRetourProblemeUtilisateur:", error);
    const err = new Error("Erreur lors de la confirmation du retour avec problème");
    err.status = 500;
    throw err;
  }

  await supabase.from("materiels").update({
    statut: "INDISPONIBLE",
    etat: "ENDOMMAGE",
    updated_at: new Date().toISOString(),
  }).eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel "${emprunt.materiel.nom}" a été signalé avec un problème.`,
    type: "RETOUR_PROBLEME_MATERIEL_UTILISATEUR",
  });

  return data;
};

module.exports = {
  getDemandesRecues,
  accepterDemandeUtilisateur,
  refuserDemandeUtilisateur,
  confirmerRemiseUtilisateur,
  confirmerRetourNormalUtilisateur,
  confirmerRetourProblemeUtilisateur,
};