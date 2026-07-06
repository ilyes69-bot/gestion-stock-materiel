import { useState } from "react";
import toast from "react-hot-toast";
import { demanderCreationSociete } from "../../services/societeService";

const DemanderSociete = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error("Le nom de la société est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      await demanderCreationSociete(formData);

      toast.success("Demande de société envoyée avec succès.");
      setSuccess(true);

      setFormData({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        description: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de l’envoi de la demande.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-owner-page">
      <div className="page-header">
        <h1>Créer ma société</h1>
        <p>
          Remplissez ce formulaire pour demander la création d’un espace société.
          Après validation par le super admin, vous deviendrez admin société.
        </p>
      </div>

      {success && (
        <div className="success-message">
          Votre demande a bien été envoyée. Elle est en attente de validation par
          le super admin.
        </div>
      )}

      <form onSubmit={handleSubmit} className="owner-material-form">
        <div className="form-group">
          <label>Nom de la société</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Exemple : MusicPro"
          />
        </div>

        <div className="owner-form-grid">
          <div className="form-group">
            <label>Email société</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@societe.com"
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+216 ..."
            />
          </div>
        </div>

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            placeholder="Adresse de la société"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Présentez brièvement votre société..."
          ></textarea>
        </div>

        <div className="owner-form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemanderSociete;