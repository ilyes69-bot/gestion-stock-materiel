const {
  getAllHistorique,
  getHistoriqueByUser,
} = require("../services/historique.service");

const getHistoriqueAdmin = async (req, res) => {
  try {
    const historique = await getAllHistorique();

    res.status(200).json({
      message: "Historique global",
      data: historique,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getHistoriqueAdmin,
  getMonHistorique,
};