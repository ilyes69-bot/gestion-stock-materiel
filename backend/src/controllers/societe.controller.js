const {
  demanderCreationSociete,
  getToutesSocietes,
  getSocietesEnAttente,
  approuverSociete,
  refuserSociete,
  demanderSocietePublique,
} = require("../services/societe.service");

const requestSociete = async (req, res) => {
  try {
    const societe = await demanderCreationSociete(req.user.id, req.body);

    res.status(201).json({
      message: "Demande de création de société envoyée avec succès.",
      societe,
    });
  } catch (error) {
    console.log("ERREUR REQUEST SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const societes = await getToutesSocietes();

    res.status(200).json({
      societes,
    });
  } catch (error) {
    console.log("ERREUR GET ALL SOCIETES:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getPending = async (req, res) => {
  try {
    const societes = await getSocietesEnAttente();

    res.status(200).json({
      societes,
    });
  } catch (error) {
    console.log("ERREUR GET PENDING SOCIETES:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const approve = async (req, res) => {
  try {
    const societe = await approuverSociete(req.user.id, req.params.id);

    res.status(200).json({
      message: "Société approuvée avec succès.",
      societe,
    });
  } catch (error) {
    console.log("ERREUR APPROVE SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const refuse = async (req, res) => {
  try {
    const { commentaire } = req.body;

    const societe = await refuserSociete(
      req.user.id,
      req.params.id,
      commentaire
    );

    res.status(200).json({
      message: "Société refusée avec succès.",
      societe,
    });
  } catch (error) {
    console.log("ERREUR REFUSE SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};
const publicRequestSociete = async (req, res) => {
  try {
    const result = await demanderSocietePublique(req.body);

    res.status(201).json({
      message:
        "Compte créé et demande de société envoyée avec succès. Elle est en attente de validation.",
      user: result.user,
      societe: result.societe,
    });
  } catch (error) {
    console.log("ERREUR PUBLIC REQUEST SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  requestSociete,
  getAll,
  getPending,
  approve,
  refuse,
  publicRequestSociete,
};