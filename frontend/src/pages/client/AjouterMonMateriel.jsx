import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createClientMateriel } from "../../services/clientMaterielService";

const AjouterMonMateriel = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie: "",
    prix_jour: "",
    ville: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFormData((prev) => ({
      ...prev,
      image: file || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error("Le nom du matériel est obligatoire.");
      return;
    }

    if (!formData.categorie.trim()) {
      toast.error("La catégorie est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("nom", formData.nom);
      data.append("description", formData.description);
      data.append("categorie", formData.categorie);
      data.append("prix_jour", formData.prix_jour);
      data.append("ville", formData.ville);

      if (formData.image) {
        data.append("image", formData.image);
      }

      await createClientMateriel(data);

      toast.success(
        "Matériel proposé avec succès. Il est en attente de validation."
      );

      navigate("/client/mes-materiels");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de l’ajout du matériel.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-owner-page">
      <div className="page-header">
        <h1>Ajouter mon matériel</h1>
        <p>
          Proposez votre propre matériel musical. Après validation par
          l’administrateur, il pourra apparaître dans le catalogue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="owner-material-form">
        <div className="form-group">
          <label>Nom du matériel</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Exemple : Guitare Yamaha"
          />
        </div>

        <div className="form-group">
          <label>Catégorie</label>
          <input
            type="text"
            name="categorie"
            value={formData.categorie}
            onChange={handleChange}
            placeholder="Exemple : Guitare, Micro, DJ..."
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez l’état, les accessoires, les détails importants..."
          ></textarea>
        </div>

        <div className="owner-form-grid">
          <div className="form-group">
            <label>Prix par jour</label>
            <input
              type="number"
              name="prix_jour"
              value={formData.prix_jour}
              onChange={handleChange}
              placeholder="Exemple : 10"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Ville</label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Exemple : Tunis"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Image du matériel</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {formData.image && (
            <p className="selected-file-name">
              Image sélectionnée : {formData.image.name}
            </p>
          )}
        </div>

        <div className="owner-form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Proposer le matériel"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/client/mes-materiels")}
          >
            Mes matériels
          </button>
        </div>
      </form>
    </div>
  );
};

export default AjouterMonMateriel;