const { getDashboardStats } = require("../services/dashboard.service");

const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    res.status(200).json({
      message: "Statistiques du dashboard",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStats,
};