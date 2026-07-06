const {
  getAllUsersForSuperAdmin,
  bloquerUtilisateur,
  debloquerUtilisateur,
} = require("../services/superAdminUser.service");

const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersForSuperAdmin();

    res.status(200).json({
      message: "Utilisateurs chargés avec succès",
      users,
    });
  } catch (error) {
    console.log("ERREUR SUPER ADMIN USERS:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await bloquerUtilisateur(req.params.id, req.body.raison);

    res.status(200).json({
      message: "Utilisateur bloqué avec succès",
      user,
    });
  } catch (error) {
    console.log("ERREUR BLOCK USER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await debloquerUtilisateur(req.params.id);

    res.status(200).json({
      message: "Utilisateur débloqué avec succès",
      user,
    });
  } catch (error) {
    console.log("ERREUR UNBLOCK USER:", error);

    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  getAllUsers,
  blockUser,
  unblockUser,
};
