const {
  getAllHistorique,
  getHistoriqueByUser,
} = require("../services/historique.service");

const getHistoriqueAdmin = async (req, res) => {
  try {
    const historique = await getAllHistorique(req.user.id);

    res.status(200).json({
      message: "Historique de la société",
      data: historique,
    });
  } catch (error) {
    console.log("ERREUR HISTORIQUE ADMIN:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const getMonHistorique = async (req, res) => {
  try {
    const historique = await getHistoriqueByUser(req.user.id);

    res.status(200).json({
      message: "Mon historique",
      data: historique,
    });
  } catch (error) {
    console.log("ERREUR MON HISTORIQUE:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getHistoriqueAdmin,
  getMonHistorique,
};