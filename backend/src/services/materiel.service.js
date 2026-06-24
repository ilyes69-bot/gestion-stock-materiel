const supabase = require("../config/supabase");

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

const getAllMateriels = async () => {
  const { data, error } = await supabase
    .from("materiels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    const err = new Error("Erreur lors du chargement des matériels");
    err.status = 500;
    throw err;
  }

  return data;
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

const createMateriel = async (materielData, file) => {
  const { nom, description, categorie } = materielData;

  if (!nom || !categorie) {
    const error = new Error("Nom et catégorie sont obligatoires");
    error.status = 400;
    throw error;
  }

  const imageUrl = await uploadMaterielImage(file);

  const { data, error } = await supabase
    .from("materiels")
    .insert([
      {
        nom,
        description,
        categorie,
        quantite: 1,
        statut: "DISPONIBLE",
        etat: "BON_ETAT",
        image_url: imageUrl,
      },
    ])
    .select()
    .single();

  if (error) {
    const err = new Error("Erreur lors de l'ajout du matériel");
    err.status = 500;
    throw err;
  }

  return data;
};

const updateMateriel = async (id, materielData) => {
  const { nom, description, categorie, statut, etat } = materielData;

  const { data, error } = await supabase
    .from("materiels")
    .update({
      nom,
      description,
      categorie,
      quantite: 1,
      statut,
      etat,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const err = new Error("Erreur lors de la modification du matériel");
    err.status = 500;
    throw err;
  }

  return data;
};

const deleteMateriel = async (id) => {
  const { error } = await supabase
    .from("materiels")
    .delete()
    .eq("id", id);

  if (error) {
    const err = new Error("Erreur lors de la suppression du matériel");
    err.status = 500;
    throw err;
  }

  return true;
};

module.exports = {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
};