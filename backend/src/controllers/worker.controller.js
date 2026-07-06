const {
  getMaterielByQrToken,
  confirmerSortie,
  retourNormal: validerRetourNormal,
  retourProbleme: validerRetourProbleme,
  getAllEmpruntsWorker,
} = require("../services/worker.service");

const scanMateriel = async (req, res) => {
  try {
    const result = await getMaterielByQrToken(req.user.id, req.params.qrToken);

    res.status(200).json({
      message: "Matériel trouvé",
      materiel: result.materiel,
      emprunt: result.emprunt,
    });
  } catch (error) {
    console.log("ERREUR SCAN WORKER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmSortie = async (req, res) => {
  try {
    const emprunt = await confirmerSortie(req.user.id, req.params.id);

    res.status(200).json({
      message: "Sortie confirmée avec succès",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR CONFIRM SORTIE WORKER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const retourNormal = async (req, res) => {
  try {
    const emprunt = await validerRetourNormal(req.user.id, req.params.id);

    res.status(200).json({
      message: "Retour normal déclaré avec succès",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR RETOUR NORMAL WORKER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const retourProbleme = async (req, res) => {
  try {
    const emprunt = await validerRetourProbleme(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      message: "Retour avec problème déclaré avec succès",
      emprunt,
    });
  } catch (error) {
    console.log("ERREUR RETOUR PROBLEME WORKER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getEmprunts = async (req, res) => {
  try {
    const emprunts = await getAllEmpruntsWorker(req.user.id);

    res.status(200).json({
      emprunts,
    });
  } catch (error) {
    console.log("ERREUR GET EMPRUNTS WORKER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  scanMateriel,
  confirmSortie,
  retourNormal,
  retourProbleme,
  getEmprunts,
};