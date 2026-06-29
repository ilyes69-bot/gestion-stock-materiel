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
    .in("statut", [
    "EN_ATTENTE_VALIDATION",
    "VALIDE",
    "EN_COURS",
    "EN_ATTENTE_CONFIRMATION_RETOUR",
    ])
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

  if (emprunt.statut !== "VALIDE") {
    const error = new Error(
      "La sortie peut être confirmée seulement après validation par l'administrateur"
    );
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
      statut: "EN_COURS",
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

  await supabase
    .from("materiels")
    .update({
      statut: "EMPRUNTE",
      updated_at: nowDateTime(),
    })
    .eq("id", emprunt.materiel_id);

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
    description: `Sortie confirmée par le travailleur pour le matériel ${emprunt.materiels?.nom || ""}.`,
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

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour peut être déclaré seulement pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  if (!emprunt.sortie_confirmee) {
    const error = new Error("La sortie doit être confirmée avant de déclarer le retour");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
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
    const error = new Error("Erreur lors de la déclaration du retour");
    error.status = 500;
    throw error;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "BON_ETAT",
      updated_at: nowDateTime(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été déclaré en bon état. Il attend la confirmation de l'administrateur.`,
    type: "RETOUR_DECLARE",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "DECLARATION_RETOUR_NORMAL",
    description: `Retour normal déclaré par le travailleur pour le matériel ${emprunt.materiels?.nom || ""}.`,
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

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour peut être déclaré seulement pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  if (!emprunt.sortie_confirmee) {
    const error = new Error("La sortie doit être confirmée avant de déclarer le retour");
    error.status = 400;
    throw error;
  }

  const typeProbleme = type_probleme_retour || "Matériel endommagé";

  const { data: updatedEmprunt, error: updateError } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
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
    const error = new Error("Erreur lors de la déclaration du problème");
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
    contenu: `Le retour du matériel ${emprunt.materiels?.nom || ""} a été déclaré avec un problème. Commentaire : ${commentaire_retour.trim()}`,
    type: "RETOUR_PROBLEME_DECLARE",
    lu: false,
  });

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: emprunt.id,
    type_action: "DECLARATION_RETOUR_PROBLEME",
    description: `Retour avec problème déclaré par le travailleur pour le matériel ${emprunt.materiels?.nom || ""}. Type : ${typeProbleme}. Commentaire : ${commentaire_retour.trim()}`,
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