const supabase = require("../config/supabase");

const {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
} = require("../services/materiel.service");

const getMateriels = async (req, res) => {
  try {
    const materiels = await getAllMateriels(req.user.id);

    res.status(200).json({
      materiels,
    });
  } catch (error) {
    console.log("ERREUR GET MATERIELS:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMateriel = async (req, res) => {
  try {
    const materiel = await getMaterielById(req.user.id, req.params.id);

    res.status(200).json({
      materiel,
    });
  } catch (error) {
    console.log("ERREUR GET MATERIEL:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const addMateriel = async (req, res) => {
  try {
    let imageUrl = req.body.image_url || null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `societe-materiels/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materiels")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.log("Erreur upload image matériel:", uploadError);
        return res.status(500).json({
          message: "Erreur lors de l’upload de l’image",
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from("materiels")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const materiel = await createMateriel(req.user.id, {
      ...req.body,
      image_url: imageUrl,
    });

    res.status(201).json({
      message: "Matériel ajouté avec succès",
      materiel,
    });
  } catch (error) {
    console.log("ERREUR ADD MATERIEL:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const editMateriel = async (req, res) => {
  try {
    const materiel = await updateMateriel(req.user.id, req.params.id, req.body);

    res.status(200).json({
      message: "Matériel modifié avec succès",
      materiel,
    });
  } catch (error) {
    console.log("ERREUR EDIT MATERIEL:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const removeMateriel = async (req, res) => {
  try {
    await deleteMateriel(req.user.id, req.params.id);

    res.status(200).json({
      message: "Matériel supprimé avec succès",
    });
  } catch (error) {
    console.log("ERREUR DELETE MATERIEL:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getMateriels,
  getMateriel,
  addMateriel,
  editMateriel,
  removeMateriel,
};