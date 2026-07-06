import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { demanderSocietePublique } from "../../services/societeService";

const Register = () => {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("client");
  const [loading, setLoading] = useState(false);

  const [clientForm, setClientForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });

  const [societeForm, setSocieteForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    societe_nom: "",
    telephone: "",
    adresse: "",
    description: "",
  });

  const handleClientChange = (e) => {
    const { name, value } = e.target;

    setClientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocieteChange = (e) => {
    const { name, value } = e.target;

    setSocieteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientRegister = async (e) => {
    e.preventDefault();

    if (
      !clientForm.nom.trim() ||
      !clientForm.prenom.trim() ||
      !clientForm.email.trim() ||
      !clientForm.password.trim()
    ) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", clientForm);

      toast.success("Compte client créé avec succès.");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la création du compte.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocieteRegister = async (e) => {
    e.preventDefault();

    if (
      !societeForm.nom.trim() ||
      !societeForm.prenom.trim() ||
      !societeForm.email.trim() ||
      !societeForm.password.trim() ||
      !societeForm.societe_nom.trim()
    ) {
      toast.error(
        "Nom, prénom, email, mot de passe et nom de société sont obligatoires."
      );
      return;
    }

    try {
      setLoading(true);

      await demanderSocietePublique(societeForm);

      toast.success(
        "Compte créé et demande société envoyée. Elle est en attente de validation."
      );

      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la demande de création société.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Créer un compte</h1>
          <p>Choisissez le type de compte que vous souhaitez créer.</p>
        </div>

        <div className="account-type-switch">
          <button
            type="button"
            className={accountType === "client" ? "active" : ""}
            onClick={() => setAccountType("client")}
          >
            Compte client
          </button>

          <button
            type="button"
            className={accountType === "societe" ? "active" : ""}
            onClick={() => setAccountType("societe")}
          >
            Créer une société
          </button>
        </div>

        {accountType === "client" ? (
          <form onSubmit={handleClientRegister} className="auth-form">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={clientForm.nom}
                onChange={handleClientChange}
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={clientForm.prenom}
                onChange={handleClientChange}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={clientForm.email}
                onChange={handleClientChange}
                placeholder="exemple@email.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={clientForm.password}
                onChange={handleClientChange}
                placeholder="Votre mot de passe"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSocieteRegister} className="auth-form">
            <div className="auth-section-title">
              <h2>Responsable de la société</h2>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={societeForm.nom}
                  onChange={handleSocieteChange}
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={societeForm.prenom}
                  onChange={handleSocieteChange}
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={societeForm.email}
                onChange={handleSocieteChange}
                placeholder="responsable@societe.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={societeForm.password}
                onChange={handleSocieteChange}
                placeholder="Mot de passe"
              />
            </div>

            <div className="auth-section-title">
              <h2>Informations société</h2>
            </div>

            <div className="form-group">
              <label>Nom de la société</label>
              <input
                type="text"
                name="societe_nom"
                value={societeForm.societe_nom}
                onChange={handleSocieteChange}
                placeholder="Exemple : MusicPro"
              />
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  value={societeForm.telephone}
                  onChange={handleSocieteChange}
                  placeholder="+216 ..."
                />
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={societeForm.adresse}
                  onChange={handleSocieteChange}
                  placeholder="Adresse de la société"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={societeForm.description}
                onChange={handleSocieteChange}
                placeholder="Présentez brièvement votre société..."
              ></textarea>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Envoi..." : "Créer la demande société"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;