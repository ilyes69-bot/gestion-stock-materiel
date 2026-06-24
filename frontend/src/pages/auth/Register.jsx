import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const response = await register(formData);

      setSuccess(
        response.message ||
          "Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre compte."
      );

      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du compte."
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
        <h1>Créer un compte</h1>

        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            placeholder="Votre nom"
            value={formData.nom}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            placeholder="Votre prénom"
            value={formData.prenom}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p className="auth-link">
          Déjà un compte ?{" "}
          <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;