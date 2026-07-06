import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getTravailleursSociete,
  createTravailleurSociete,
  bloquerTravailleurSociete,
  debloquerTravailleurSociete,
} from "../../services/societeWorkerService";

const GestionTravailleurs = () => {
  const [travailleurs, setTravailleurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });

  const loadTravailleurs = async () => {
    try {
      setLoading(true);
      const data = await getTravailleursSociete();
      setTravailleurs(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du chargement des travailleurs.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTravailleurs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (
      !formData.nom.trim() ||
      !formData.prenom.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    try {
      await createTravailleurSociete(formData);

      toast.success("Travailleur créé avec succès.");

      setFormData({
        nom: "",
        prenom: "",
        email: "",
        password: "",
      });

      setShowForm(false);
      loadTravailleurs();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la création du travailleur.";
      toast.error(message);
    }
  };

  const handleBlock = async (id) => {
    const reason = window.prompt("Raison du blocage :");

    if (!reason || reason.trim() === "") {
      toast.error("La raison du blocage est obligatoire.");
      return;
    }

    try {
      await bloquerTravailleurSociete(id, reason);
      toast.success("Travailleur bloqué avec succès.");
      loadTravailleurs();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du blocage du travailleur.";
      toast.error(message);
    }
  };

  const handleUnblock = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous débloquer ce travailleur ?"
    );

    if (!confirmation) return;

    try {
      await debloquerTravailleurSociete(id);
      toast.success("Travailleur débloqué avec succès.");
      loadTravailleurs();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du déblocage du travailleur.";
      toast.error(message);
    }
  };

  const getStatusClass = (statut) => {
    if (statut === "actif") return "badge badge-success";
    if (statut === "bloque") return "badge badge-danger";
    return "badge badge-muted";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>Gestion des travailleurs</h1>
        <p>
          Gérez uniquement les travailleurs rattachés à votre société.
        </p>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Fermer le formulaire" : "Ajouter un travailleur"}
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="worker-create-form">
          <div className="owner-form-grid">
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
              />
            </div>

            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Prénom"
              />
            </div>
          </div>

          <div className="owner-form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="travailleur@email.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <button type="submit">Créer le travailleur</button>
        </form>
      )}

      {travailleurs.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucun travailleur</h2>
          <p>Votre société n’a pas encore de travailleur enregistré.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {travailleurs.map((travailleur) => (
                <tr key={travailleur.id}>
                  <td>{travailleur.nom}</td>
                  <td>{travailleur.prenom}</td>
                  <td>{travailleur.email}</td>
                  <td>{travailleur.role}</td>
                  <td>
                    <span className={getStatusClass(travailleur.statut_compte)}>
                      {travailleur.statut_compte}
                    </span>
                  </td>
                  <td>
                    {travailleur.date_inscription
                      ? new Date(
                          travailleur.date_inscription
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {travailleur.statut_compte === "bloque" ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleUnblock(travailleur.id)}
                      >
                        Débloquer
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleBlock(travailleur.id)}
                      >
                        Bloquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionTravailleurs;