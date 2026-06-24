import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!email) {
      setError("Veuillez entrer votre email.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email,
      });

      setSuccess(response.data.message);
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la demande de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Mot de passe oublié</h1>

        <p className="auth-description">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>

        <p className="auth-link">
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;