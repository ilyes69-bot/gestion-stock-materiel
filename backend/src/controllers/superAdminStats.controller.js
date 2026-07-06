const {
  getSuperAdminStats,
} = require("../services/superAdminStats.service");

const getStats = async (req, res) => {
  try {
    const stats = await getSuperAdminStats();

    res.status(200).json({
      message: "Statistiques globales chargées avec succès",
      stats,
    });
  } catch (error) {
    console.log("ERREUR SUPER ADMIN STATS:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getStats,
};