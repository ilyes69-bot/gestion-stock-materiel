const {
  createEmprunt,
  getMesEmprunts,
  getAllEmprunts,
  validateReturn,
  markAsDamaged,
  validerDemandeEmprunt,
  refuserDemandeEmprunt,
  confirmerRetourNormalFinal,
  confirmerRetourEndommageFinal,
} = require("../services/emprunt.service");

const create = async (req, res) => {
  try {
    const emprunt = await createEmprunt(req.user.id, req.body);

    res.status(201).json({
      message: "Emprunt créé avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMine = async (req, res) => {
  try {
    const emprunts = await getMesEmprunts(req.user.id);

    res.status(200).json({
      emprunts,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const emprunts = await getAllEmprunts();

    res.status(200).json({
      emprunts,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const validate = async (req, res) => {
  try {
    const emprunt = await validateReturn(req.params.id, req.user.id);

    res.status(200).json({
      message: "Retour validé avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const damage = async (req, res) => {
  try {
    const emprunt = await markAsDamaged(req.params.id, req.body, req.user.id);

    res.status(200).json({
      message: "Matériel signalé comme endommagé",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};
const validerDemande = async (req, res) => {
  try {
    const emprunt = await validerDemandeEmprunt(req.params.id, req.user.id);

    res.status(200).json({
      message: "Demande d'emprunt validée avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const refuserDemande = async (req, res) => {
  try {
    const emprunt = await refuserDemandeEmprunt(req.params.id, req.user.id);

    res.status(200).json({
      message: "Demande d'emprunt refusée avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmerRetourNormal = async (req, res) => {
  try {
    const emprunt = await confirmerRetourNormalFinal(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      message: "Retour normal confirmé avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmerRetourEndommage = async (req, res) => {
  try {
    const emprunt = await confirmerRetourEndommageFinal(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      message: "Retour endommagé confirmé avec succès",
      emprunt,
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
  getAll,
  validate,
  damage,
  validerDemande,
  refuserDemande,
  confirmerRetourNormal,
  confirmerRetourEndommage,
};