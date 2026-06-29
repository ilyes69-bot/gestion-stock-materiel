const supabase = require("../config/supabase");

const todayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const nowDateTime = () => {
  return new Date().toISOString();
};

const getMaterielByQrToken = async (qrToken) => {
  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("qr_token", qrToken)
    .single();
    const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!qrToken || !uuidRegex.test(qrToken)) {
    const error = new Error("QR code invalide ou incomplet");
    error.status = 400;
    throw error;
    }

  if (materielError || !materiel) {
    const error = new Error("Matériel introuvable avec ce QR code");
    error.status = 404;
    throw error;
  }

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
        description,
        categorie,
        statut,
        etat,
        image_url,
        qr_token
      )
    `)
    .eq("materiel_id", materiel.id)
    .eq("statut", "EN_COURS")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (empruntError) {
    const error = new Error("Erreur lors de la recherche de l'emprunt");
    error.status = 500;
    throw error;
  }

  return {
    materiel,
    emprunt: emprunt || null,
  };
};

const confirmerSortie = async (empruntId, workerId) => {
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
    const error = new Error("Emprunt introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Cet emprunt n'est pas en cours");
    error.status = 400;
    throw error;
  }

  if (emprunt.sortie_confirmee) {
    const error = new Error("La sortie de ce matériel est déjà confirmée");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      sortie_confirmee: true,
      date_sortie_effective: nowDateTime(),
      sortie_par: workerId,
      updated_at: nowDateTime(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors de la confirmation de sortie");
    error.status = 500;
    throw error;
  }

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `La sortie du matériel ${emprunt.materiels?.nom || ""} a été confirmée.`,
    type: "SORTIE_MATERIEL",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "CONFIRMATION_SORTIE",
    description: `Sortie confirmée pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const validerRetourNormal = async (empruntId, workerId) => {
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
      retour_par: workerId,
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: nowDateTime(),
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
      updated_at: nowDateTime(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été validé en bon état.`,
    type: "RETOUR_NORMAL",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "RETOUR_NORMAL_SCAN",
    description: `Retour normal validé après scan pour le matériel ${emprunt.materiels?.nom || ""}.`,
  });

  return updatedEmprunt;
};

const validerRetourProbleme = async (empruntId, data, workerId) => {
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
      retour_par: workerId,
      probleme_retour: true,
      type_probleme_retour: typeProbleme,
      commentaire_retour: commentaire_retour.trim(),
      updated_at: nowDateTime(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (updateError) {
    const error = new Error("Erreur lors du signalement du problème");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "ENDOMMAGE",
      updated_at: nowDateTime(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le matériel ${emprunt.materiels?.nom || ""} a été retourné avec un problème. Commentaire : ${commentaire_retour.trim()}`,
    type: "RETOUR_AVEC_PROBLEME",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "RETOUR_PROBLEME_SCAN",
    description: `Retour avec problème après scan pour le matériel ${emprunt.materiels?.nom || ""}. Type : ${typeProbleme}. Commentaire : ${commentaire_retour.trim()}`,
  });

  return updatedEmprunt;
};
    const getAllEmpruntsWorker = async () => {
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
            image_url,
            qr_token
        )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.log("Erreur getAllEmpruntsWorker:", error);

        const err = new Error("Erreur lors du chargement des emprunts");
        err.status = 500;
        throw err;
    }

    return data;
    };
module.exports = {
  getMaterielByQrToken,
  confirmerSortie,
  validerRetourNormal,
  validerRetourProbleme,
  getAllEmpruntsWorker,
};