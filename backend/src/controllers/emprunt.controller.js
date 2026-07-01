const {
  createEmprunt,
  getEmpruntsByClient,
  getAllEmprunts,
  validerDemandeEmprunt,
  refuserDemandeEmprunt,
  confirmerRetourNormalFinal,
  confirmerRetourEndommageFinal,
} = require("../services/emprunt.service");

const create = async (req, res) => {
  try {
    const emprunt = await createEmprunt(req.user.id, req.body);

    res.status(201).json({
      message: "Demande d'emprunt créée avec succès.",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR CREATE EMPRUNT:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMine = async (req, res) => {
  try {
    const emprunts = await getEmpruntsByClient(req.user.id);

    res.status(200).json({
      emprunts,
    });
  } catch (error) {
    console.log("ERREUR GET MINE EMPRUNTS:", error);
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
    console.log("ERREUR GET ALL EMPRUNTS:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const validerDemande = async (req, res) => {
  try {
    const emprunt = await validerDemandeEmprunt(req.user.id, req.params.id);

    res.status(200).json({
      message: "Demande validée avec succès.",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR VALIDER DEMANDE:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const refuserDemande = async (req, res) => {
  try {
    const emprunt = await refuserDemandeEmprunt(req.user.id, req.params.id);

    res.status(200).json({
      message: "Demande refusée avec succès.",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR REFUSER DEMANDE:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmerRetourNormal = async (req, res) => {
  try {
    const emprunt = await confirmerRetourNormalFinal(req.user.id, req.params.id);

    res.status(200).json({
      message: "Retour normal confirmé avec succès.",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR CONFIRMER RETOUR NORMAL:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmerRetourEndommage = async (req, res) => {
  try {
    const emprunt = await confirmerRetourEndommageFinal(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Retour endommagé confirmé avec succès.",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR CONFIRMER RETOUR ENDOMMAGE:", error);
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  create,
  getMine,
  getAll,
  validerDemande,
  refuserDemande,
  confirmerRetourNormal,
  confirmerRetourEndommage,

  // Aliases pour éviter les erreurs avec tes anciennes routes
  createEmprunt: create,
  getMyEmprunts: getMine,
  getMesEmprunts: getMine,
  getClientEmprunts: getMine,
  getEmpruntsByClient: getMine,
  getAllEmprunts: getAll,

  validerDemandeEmprunt: validerDemande,
  refuserDemandeEmprunt: refuserDemande,

  confirmerRetourNormalFinal: confirmerRetourNormal,
  confirmerRetourEndommageFinal: confirmerRetourEndommage,

  validateReturn: confirmerRetourNormal,
  markAsDamaged: confirmerRetourEndommage,
  validerRetour: confirmerRetourNormal,
  signalerEndommage: confirmerRetourEndommage,
};