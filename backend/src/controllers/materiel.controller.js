const {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
} = require("../services/materiel.service");

const getMateriels = async (req, res) => {
  try {
    const materiels = await getAllMateriels();

    res.status(200).json({
      materiels,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMateriel = async (req, res) => {
  try {
    const materiel = await getMaterielById(req.params.id);

    res.status(200).json({
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const addMateriel = async (req, res) => {
  try {
    const materiel = await createMateriel(req.body, req.file);

    res.status(201).json({
      message: "Matériel ajouté avec succès",
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const editMateriel = async (req, res) => {
  try {
    const materiel = await updateMateriel(req.params.id, req.body);

    res.status(200).json({
      message: "Matériel modifié avec succès",
      materiel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const removeMateriel = async (req, res) => {
  try {
    await deleteMateriel(req.params.id);

    res.status(200).json({
      message: "Matériel supprimé avec succès",
    });
  } catch (error) {
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