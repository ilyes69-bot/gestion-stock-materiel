const supabase = require("../config/supabase");

const {
  createClientMateriel,
  getMesMateriels,
  getMaterielsClientsEnAttente,
  approuverMaterielClient,
  refuserMaterielClient,
  getCataloguePublic,
} = require("../services/clientMateriel.service");

const create = async (req, res) => {
  try {
    let imageUrl = req.body.image_url || null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `client-materiels/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("materiels")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.log("Erreur upload image:", uploadError);
        return res.status(500).json({
          message: "Erreur lors de l’upload de l’image",
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from("materiels")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const materiel = await createClientMateriel(req.user.id, {
      ...req.body,
      image_url: imageUrl,
    });

    res.status(201).json({
      message: "Matériel proposé avec succès. Il est en attente de validation.",
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMine = async (req, res) => {
  try {
    const materiels = await getMesMateriels(req.user.id);

    res.status(200).json({
      materiels,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getPending = async (req, res) => {
  try {
    const materiels = await getMaterielsClientsEnAttente();

    res.status(200).json({
      materiels,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const approve = async (req, res) => {
  try {
    const materiel = await approuverMaterielClient(req.user.id, req.params.id);

    res.status(200).json({
      message: "Matériel approuvé avec succès.",
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const refuse = async (req, res) => {
  try {
    const { commentaire } = req.body;

    const materiel = await refuserMaterielClient(
      req.user.id,
      req.params.id,
      commentaire
    );

    res.status(200).json({
      message: "Matériel refusé avec succès.",
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getCatalogue = async (req, res) => {
  try {
    const materiels = await getCataloguePublic();

    res.status(200).json({
      materiels,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  create,
  getMine,
  getPending,
  approve,
  refuse,
  getCatalogue,
};