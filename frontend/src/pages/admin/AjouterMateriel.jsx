import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMateriel } from "../../services/materielService";
import toast from "react-hot-toast";

const AjouterMateriel = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir une image valide.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 2 Mo.");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.nom || !formData.categorie) {
      setError("Le nom et la catégorie sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("nom", formData.nom);
      data.append("description", formData.description);
      data.append("categorie", formData.categorie);

      if (image) {
        data.append("image", image);
      }

      await createMateriel(data);

      setSuccess("Matériel ajouté avec succès.");
      toast.success("Matériel ajouté avec succès.");

      setTimeout(() => {
        navigate("/admin/materiels");
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'ajout du matériel."
      );
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de l'ajout du matériel."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Ajouter un matériel</h1>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Photo du matériel</label>

            <label className="image-upload-box">
              {preview ? (
                <img src={preview} alt="Aperçu du matériel" />
              ) : (
                <div>
                  <span>Importer une photo</span>
                  <small>JPG, PNG ou WEBP - max 2 Mo</small>
                </div>
              )}

              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="form-group">
            <label>Nom du matériel</label>
            <input
              type="text"
              name="nom"
              placeholder="Ex : Ordinateur Dell"
              value={formData.nom}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Description du matériel"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <input
              type="text"
              name="categorie"
              placeholder="Ex : Informatique"
              value={formData.categorie}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Ajout..." : "Ajouter le matériel"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/admin/materiels")}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterMateriel;