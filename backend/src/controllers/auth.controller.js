const {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id);

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const verify = async (req, res) => {
  try {
    await verifyEmail(req.params.token);

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?verified=success`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?verified=error`
    );
  }
};
const forgotPassword = async (req, res) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};

const resetPasswordController = async (req, res) => {
  try {
    const result = await resetPassword(req.params.token, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Erreur serveur",
    });
  }
};
module.exports = {
  register,
  login,
  me,
  verify,
  forgotPassword,
  resetPasswordController,
};