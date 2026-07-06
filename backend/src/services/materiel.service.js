const supabase = require("../config/supabase");
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

const uploadMaterielImage = async (file) => {
  if (!file) return null;

  const extension = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
  const filePath = `images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("materiels")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    const error = new Error("Erreur lors de l'upload de l'image");
    error.status = 500;
    throw error;
  }

  const { data } = supabase.storage
    .from("materiels")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const getAllMateriels = async (adminId) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data, error } = await supabase
    .from("materiels")
    .select("*")
    .eq("proprietaire_type", "SOCIETE")
    .eq("societe_id", societeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getAllMateriels:", error);

    const err = new Error("Erreur lors du chargement des matériels");
    err.status = 500;
    throw err;
  }

  return data || [];
};

const getMaterielById = async (id) => {
  const { data, error } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    const err = new Error("Matériel introuvable");
    err.status = 404;
    throw err;
  }

  return data;
};

const createMateriel = async (adminId, data) => {
  const societeId = await getAdminSocieteId(adminId);

  const {
    nom,
    description,
    categorie,
    statut,
    etat,
    quantite,
    image_url,
  } = data;

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
      statut: statut || "DISPONIBLE",
      etat: etat || "BON_ETAT",
      quantite: quantite ? Number(quantite) : 1,
      image_url: image_url || null,

      proprietaire_type: "SOCIETE",
      societe_id: societeId,
      statut_validation: "APPROUVE",
    })
    .select()
    .single();

  if (error) {
    console.log("Erreur createMateriel:", error);

    const err = new Error("Erreur lors de la création du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: materiel.id,
    type_action: "AJOUT_MATERIEL_SOCIETE",
    description: `L'admin société a ajouté le matériel ${materiel.nom}.`,
  });

  return materiel;
};

const updateMateriel = async (adminId, materielId, data) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data: existingMateriel, error: existingError } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", materielId)
    .eq("proprietaire_type", "SOCIETE")
    .eq("societe_id", societeId)
    .single();

  if (existingError || !existingMateriel) {
    const error = new Error("Matériel introuvable dans votre société");
    error.status = 404;
    throw error;
  }

  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (data.nom !== undefined) {
    if (!data.nom || data.nom.trim() === "") {
      const error = new Error("Le nom du matériel est obligatoire");
      error.status = 400;
      throw error;
    }

    updateData.nom = data.nom.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.categorie !== undefined) {
    if (!data.categorie || data.categorie.trim() === "") {
      const error = new Error("La catégorie est obligatoire");
      error.status = 400;
      throw error;
    }

    updateData.categorie = data.categorie.trim();
  }

  if (data.statut !== undefined) {
    updateData.statut = data.statut;
  }

  if (data.etat !== undefined) {
    updateData.etat = data.etat;
  }

  if (data.quantite !== undefined) {
    updateData.quantite = Number(data.quantite);
  }

  if (data.image_url !== undefined) {
    updateData.image_url = data.image_url;
  }

  const { data: updatedMateriel, error } = await supabase
    .from("materiels")
    .update(updateData)
    .eq("id", materielId)
    .eq("proprietaire_type", "SOCIETE")
    .eq("societe_id", societeId)
    .select()
    .single();

  if (error) {
    console.log("Erreur updateMateriel:", error);

    const err = new Error("Erreur lors de la modification du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    materiel_id: materielId,
    type_action: "MODIFICATION_MATERIEL_SOCIETE",
    description: `L'admin société a modifié le matériel ${updatedMateriel.nom}.`,
  });

  return updatedMateriel;
};

const deleteMateriel = async (adminId, materielId) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", materielId)
    .eq("proprietaire_type", "SOCIETE")
    .eq("societe_id", societeId)
    .single();

  if (materielError || !materiel) {
    const error = new Error("Matériel introuvable dans votre société");
    error.status = 404;
    throw error;
  }

  const { data: empruntsActifs, error: empruntsError } = await supabase
    .from("emprunts")
    .select("id, statut")
    .eq("materiel_id", materielId)
    .in("statut", [
      "EN_ATTENTE_VALIDATION",
      "VALIDE",
      "EN_COURS",
      "EN_ATTENTE_CONFIRMATION_RETOUR",
    ]);

  if (empruntsError) {
    console.log("Erreur verification emprunts actifs:", empruntsError);

    const error = new Error("Erreur lors de la vérification des emprunts");
    error.status = 500;
    throw error;
  }

  if (empruntsActifs && empruntsActifs.length > 0) {
    const error = new Error(
      "Impossible de supprimer ce matériel car il est lié à un emprunt actif"
    );
    error.status = 400;
    throw error;
  }

  await supabase
    .from("historique_actions")
    .delete()
    .eq("materiel_id", materielId);

  const { error } = await supabase
    .from("materiels")
    .delete()
    .eq("id", materielId)
    .eq("proprietaire_type", "SOCIETE")
    .eq("societe_id", societeId);

  if (error) {
    console.log("Erreur deleteMateriel:", error);

    const err = new Error("Erreur lors de la suppression du matériel");
    err.status = 500;
    throw err;
  }

  await supabase.from("historique_actions").insert({
    user_id: adminId,
    type_action: "SUPPRESSION_MATERIEL_SOCIETE",
    description: `L'admin société a supprimé le matériel ${materiel.nom}.`,
  });

  return true;
};

module.exports = {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
};