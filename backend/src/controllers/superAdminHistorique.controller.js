const {
  getHistoriqueGlobalSuperAdmin,
} = require("../services/superAdminHistorique.service");

const getHistoriqueGlobal = async (req, res) => {
  try {
    const historique = await getHistoriqueGlobalSuperAdmin();

    res.status(200).json({
      message: "Historique global chargé avec succès",
      historique,
    });
  } catch (error) {
    console.log("ERREUR HISTORIQUE GLOBAL SUPER ADMIN:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getHistoriqueGlobal,
};