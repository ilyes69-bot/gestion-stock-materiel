const supabase = require("../config/supabase");

const createClientMateriel = async (clientId, data) => {
  const { nom, description, categorie, prix_jour, ville, image_url } = data;

  if (!nom || nom.trim() === "") {
    const error = new Error("Le nom du matériel est obligatoire");
    error.status = 400;
    throw error;
  }

  if (!categorie || categorie.trim() === "") {
    const error = new Error("La catégorie est obligatoire");
    error.status = 400;
    throw error;
  }

  const { data: materiel, error } = await supabase
    .from("materiels")
    .insert({
      nom: nom.trim(),
      description: description || "",
      categorie: categorie.trim(),
      statut: "DISPONIBLE",
      etat: "BON_ETAT",
      quantite: 1,
      image_url: image_url || null,

      proprietaire_type: "UTILISATEUR",
      owner_user_id: clientId,
      statut_validation: "EN_ATTENTE",
      commentaire_validation: null,
      prix_jour: prix_jour || null,
      ville: ville || null,
    })
    .select()
    .single();

  if (error) {
    console.log("Erreur createClientMateriel:", error);
    const err = new Error("Erreur lors de l'ajout du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: clientId,
    materiel_id: materiel.id,
    type_action: "PROPOSITION_MATERIEL_CLIENT",
    description: `Le client a proposé le matériel ${materiel.nom}.`,
  });

  return materiel;
};

const getMesMateriels = async (clientId) => {
  const { data, error } = await supabase
    .from("materiels")
    .select("*")
    .eq("owner_user_id", clientId)
    .eq("proprietaire_type", "UTILISATEUR")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getMesMateriels:", error);
    const err = new Error("Erreur lors du chargement de vos matériels");
    err.status = 500;
    throw err;
  }

  return data;
};

const getMaterielsClientsEnAttente = async () => {
  const { data, error } = await supabase
    .from("materiels")
    .select(`
      *,
      owner:users!materiels_owner_user_id_fkey (
        id,
        nom,
        prenom,
        email
      )
    `)
    .eq("proprietaire_type", "UTILISATEUR")
    .eq("statut_validation", "EN_ATTENTE")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getMaterielsClientsEnAttente:", error);
    const err = new Error("Erreur lors du chargement des matériels en attente");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const approuverMaterielClient = async (superAdminId, materielId) => {
  const { data: materiel, error } = await supabase
    .from("materiels")
    .update({
      statut_validation: "APPROUVE",
      commentaire_validation: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", materielId)
    .eq("proprietaire_type", "UTILISATEUR")
    .select()
    .single();

  if (error) {
    console.log("Erreur approuverMaterielClient:", error);
    const err = new Error("Erreur lors de la validation du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: superAdminId,
    materiel_id: materiel.id,
    type_action: "VALIDATION_MATERIEL_CLIENT",
    description: `Le super admin a approuvé le matériel utilisateur ${materiel.nom}.`,
  });

  if (materiel.owner_user_id) {
    await supabase.from("notifications").insert({
      user_id: materiel.owner_user_id,
      contenu: `Votre matériel "${materiel.nom}" a été approuvé.`,
      type: "VALIDATION_MATERIEL",
    });
  }

  return materiel;
};

const refuserMaterielClient = async (superAdminId, materielId, commentaire) => {
  const motif =
    commentaire && commentaire.trim() !== ""
      ? commentaire.trim()
      : "Votre matériel a été refusé par le super admin.";

  const { data: materiel, error } = await supabase
    .from("materiels")
    .update({
      statut_validation: "REFUSE",
      commentaire_validation: motif,
      updated_at: new Date().toISOString(),
    })
    .eq("id", materielId)
    .eq("proprietaire_type", "UTILISATEUR")
    .select()
    .single();

  if (error) {
    console.log("Erreur refuserMaterielClient:", error);
    const err = new Error("Erreur lors du refus du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: superAdminId,
    materiel_id: materiel.id,
    type_action: "REFUS_MATERIEL_CLIENT",
    description: `Le super admin a refusé le matériel utilisateur ${materiel.nom}.`,
  });

  if (materiel.owner_user_id) {
    await supabase.from("notifications").insert({
      user_id: materiel.owner_user_id,
      contenu: `Votre matériel "${materiel.nom}" a été refusé. Raison : ${motif}`,
      type: "REFUS_MATERIEL",
    });
  }

  return materiel;
};

const getCataloguePublic = async () => {
  const { data, error } = await supabase
    .from("materiels")
    .select(`
      *,
      owner:users!materiels_owner_user_id_fkey (
        id,
        nom,
        prenom,
        email
      )
    `)
    .or(
      "proprietaire_type.eq.SOCIETE,and(proprietaire_type.eq.UTILISATEUR,statut_validation.eq.APPROUVE)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getCataloguePublic:", error);
    const err = new Error("Erreur lors du chargement du catalogue");
    err.status = 500;
    throw err;
  }

  return data || [];
};

module.exports = {
  createClientMateriel,
  getMesMateriels,
  getMaterielsClientsEnAttente,
  approuverMaterielClient,
  refuserMaterielClient,
  getCataloguePublic,
};