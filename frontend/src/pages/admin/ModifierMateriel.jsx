import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMaterielById,
  updateMateriel,
} from "../../services/materielService";

const ModifierMateriel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    categorie: "",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMateriel = async () => {
    try {
      const materiel = await getMaterielById(id);

      setFormData({
        nom: materiel.nom || "",
        description: materiel.description || "",
        categorie: materiel.categorie || "",
        statut: materiel.statut || "DISPONIBLE",
        etat: materiel.etat || "BON_ETAT",
      });
    } catch (err) {
      setError("Erreur lors du chargement du matériel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriel();
  }, [id]);

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

    if (!formData.nom || !formData.categorie) {
      setError("Le nom et la catégorie sont obligatoires.");
      return;
    }

    try {
      setSaving(true);

      await updateMateriel(id, formData);

      setSuccess("Matériel modifié avec succès.");

      setTimeout(() => {
        navigate("/admin/materiels");
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la modification du matériel."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Modifier le matériel</h1>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
            >
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="EMPRUNTE">EMPRUNTE</option>
              <option value="INDISPONIBLE">INDISPONIBLE</option>
            </select>
          </div>

          <div className="form-group">
            <label>État</label>
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
            >
              <option value="BON_ETAT">BON_ETAT</option>
              <option value="ENDOMMAGE">ENDOMMAGE</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Modification..." : "Modifier le matériel"}
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

export default ModifierMateriel;