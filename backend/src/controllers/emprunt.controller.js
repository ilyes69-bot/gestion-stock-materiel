const {
  createEmprunt,
  getMyEmprunts,
  getAllEmprunts,
  validerRetour,
  signalerMaterielEndommage,
} = require("../services/emprunt.service");

const addEmprunt = async (req, res) => {
  try {
    const emprunt = await createEmprunt({
      clientId: req.user.id,
      materielId: req.body.materiel_id,
      dateDebut: req.body.date_debut,
      dateFin: req.body.date_fin,
    });

    res.status(201).json({
      message: "Emprunt créé avec succès",
      data: emprunt,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getMesEmprunts = async (req, res) => {
  try {
    const emprunts = await getMyEmprunts(req.user.id);

    res.status(200).json({
      message: "Liste de mes emprunts",
      data: emprunts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getEmpruntsAdmin = async (req, res) => {
  try {
    const emprunts = await getAllEmprunts();

    res.status(200).json({
      message: "Liste des emprunts",
      data: emprunts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const validerRetourMateriel = async (req, res) => {
  try {
    const emprunt = await validerRetour(req.params.id, req.user.id);

    res.status(200).json({
      message: "Retour validé avec succès",
      data: emprunt,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const signalerEndommage = async (req, res) => {
  try {
    const emprunt = await signalerMaterielEndommage(req.params.id, req.user.id);

    res.status(200).json({
      message: "Matériel signalé comme endommagé",
      data: emprunt,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  addEmprunt,
  getMesEmprunts,
  getEmpruntsAdmin,
  validerRetourMateriel,
  signalerEndommage,
};