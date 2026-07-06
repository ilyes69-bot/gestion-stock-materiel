const { getDashboardStats } = require("../services/dashboard.service");

const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats(req.user.id);

    res.status(200).json({
      message: "Statistiques du dashboard",
      data: stats,
    });
  } catch (error) {
    console.log("ERREUR DASHBOARD STATS:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getStats,
};