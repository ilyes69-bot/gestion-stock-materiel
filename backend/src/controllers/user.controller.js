const {
  getAllUsers,
  blockUser,
  unblockUser,
} = require("../services/user.service");

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const block = async (req, res) => {
  try {
    const user = await blockUser(
      req.params.id,
      req.body.reason,
      req.user.id
    );

    res.status(200).json({
      message: "Utilisateur bloqué avec succès",
      user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const unblock = async (req, res) => {
  try {
    const user = await unblockUser(req.params.id);

    res.status(200).json({
      message: "Utilisateur débloqué avec succès",
      user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

module.exports = {
  listUsers,
  block,
  unblock,
};