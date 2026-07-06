const {
  getTravailleursSociete,
  createTravailleurSociete,
  bloquerTravailleurSociete,
  debloquerTravailleurSociete,
} = require("../services/societeWorker.service");

const getAll = async (req, res) => {
  try {
    const travailleurs = await getTravailleursSociete(req.user.id);

    res.status(200).json({
      travailleurs,
    });
  } catch (error) {
    console.log("ERREUR GET TRAVAILLEURS SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const create = async (req, res) => {
  try {
    const travailleur = await createTravailleurSociete(req.user.id, req.body);

    res.status(201).json({
      message: "Travailleur créé avec succès.",
      travailleur,
    });
  } catch (error) {
    console.log("ERREUR CREATE TRAVAILLEUR SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const block = async (req, res) => {
  try {
    const { reason } = req.body;

    const travailleur = await bloquerTravailleurSociete(
      req.user.id,
      req.params.id,
      reason
    );

    res.status(200).json({
      message: "Travailleur bloqué avec succès.",
      travailleur,
    });
  } catch (error) {
    console.log("ERREUR BLOCK TRAVAILLEUR SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const unblock = async (req, res) => {
  try {
    const travailleur = await debloquerTravailleurSociete(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      message: "Travailleur débloqué avec succès.",
      travailleur,
    });
  } catch (error) {
    console.log("ERREUR UNBLOCK TRAVAILLEUR SOCIETE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getAll,
  create,
  block,
  unblock,
};