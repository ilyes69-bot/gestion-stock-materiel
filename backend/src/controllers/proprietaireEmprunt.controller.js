const {
  getDemandesRecues,
  accepterDemandeUtilisateur,
  refuserDemandeUtilisateur,
  confirmerRemiseUtilisateur,
  confirmerRetourNormalUtilisateur,
  confirmerRetourProblemeUtilisateur,
} = require("../services/proprietaireEmprunt.service");

const getReceived = async (req, res) => {
  try {
    const demandes = await getDemandesRecues(req.user.id);

    res.status(200).json({
      demandes,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const accept = async (req, res) => {
  try {
    const demande = await accepterDemandeUtilisateur(req.user.id, req.params.id);

    res.status(200).json({
      message: "Demande acceptée avec succès.",
      demande,
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

    const demande = await refuserDemandeUtilisateur(
      req.user.id,
      req.params.id,
      commentaire
    );

    res.status(200).json({
      message: "Demande refusée avec succès.",
      demande,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmHandover = async (req, res) => {
  try {
    const demande = await confirmerRemiseUtilisateur(req.user.id, req.params.id);

    res.status(200).json({
      message: "Remise du matériel confirmée avec succès.",
      demande,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmReturnNormal = async (req, res) => {
  try {
    const demande = await confirmerRetourNormalUtilisateur(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      message: "Retour normal confirmé avec succès.",
      demande,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmReturnProblem = async (req, res) => {
  try {
    const demande = await confirmerRetourProblemeUtilisateur(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Retour avec problème confirmé avec succès.",
      demande,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getReceived,
  accept,
  refuse,
  confirmHandover,
  confirmReturnNormal,
  confirmReturnProblem,
};