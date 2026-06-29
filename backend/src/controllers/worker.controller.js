const {
  getMaterielByQrToken,
  confirmerSortie,
  validerRetourNormal,
  validerRetourProbleme,
  getAllEmpruntsWorker,
} = require("../services/worker.service");

const scanMateriel = async (req, res) => {
  try {
    const result = await getMaterielByQrToken(req.params.qrToken);

    res.status(200).json({
      message: "Matériel trouvé",
      materiel: result.materiel,
      emprunt: result.emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const confirmSortie = async (req, res) => {
  try {
    const emprunt = await confirmerSortie(req.params.id, req.user.id);

    res.status(200).json({
      message: "Sortie confirmée avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const retourNormal = async (req, res) => {
  try {
    const emprunt = await validerRetourNormal(req.params.id, req.user.id);

    res.status(200).json({
      message: "Retour normal validé avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const retourProbleme = async (req, res) => {
  try {
    const emprunt = await validerRetourProbleme(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      message: "Retour avec problème validé avec succès",
      emprunt,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};
    const getEmprunts = async (req, res) => {
    try {
        const emprunts = await getAllEmpruntsWorker();

        res.status(200).json({
        emprunts,
        });
    } catch (error) {
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