import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login?reset=success");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la modification du mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Nouveau mot de passe</h1>

        <p className="auth-description">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>

        <p className="auth-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;