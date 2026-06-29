import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");
    const reset = params.get("reset");

    if (reset === "success") {
      setSuccess("Mot de passe modifié avec succès. Vous pouvez vous connecter.");
    }

    if (verified === "success") {
      setSuccess("Votre email a été confirmé avec succès. Vous pouvez vous connecter.");
    }

    if (verified === "error") {
      setError("Le lien de confirmation est invalide ou expiré.");
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(email, password);

      if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (user.role === "travailleur") {
          navigate("/worker/scan");
        } else {
          navigate("/client/catalogue");
        }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-home-button">
        ← Accueil
      </Link>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Connexion</h1>

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

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <p className="forgot-password-link">
           <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </p>
        <button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="auth-link">
          Pas encore de compte ?{" "}
          <Link to="/register">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;