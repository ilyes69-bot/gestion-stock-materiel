import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMaterielById } from "../../services/materielService";

const DetailMateriel = () => {
  const { id } = useParams();

  const [materiel, setMateriel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMateriel = async () => {
    try {
      const data = await getMaterielById(id);
      setMateriel(data);
    } catch (err) {
      setError("Matériel introuvable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriel();
  }, [id]);

  const getStatutClass = (statut) => {
    if (statut === "DISPONIBLE") return "badge badge-success";
    if (statut === "EMPRUNTE") return "badge badge-warning";
    return "badge badge-danger";
  };

  const getEtatClass = (etat) => {
    if (etat === "BON_ETAT") return "badge badge-success";
    return "badge badge-danger";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="detail-page">
      <div className="detail-card">
        <h1>{materiel.nom}</h1>

        <p className="detail-description">
          {materiel.description || "Aucune description disponible."}
        </p>

        <div className="detail-info-grid">
          <div className="detail-info-box">
            <span>Catégorie</span>
            <strong>{materiel.categorie || "Non définie"}</strong>
          </div>

          <div className="detail-info-box">
            <span>Statut</span>
            <span className={getStatutClass(materiel.statut)}>
              {materiel.statut}
            </span>
          </div>

          <div className="detail-info-box">
            <span>État</span>
            <span className={getEtatClass(materiel.etat)}>
              {materiel.etat}
            </span>
          </div>
        </div>

        <div className="detail-actions">
          {materiel.statut === "DISPONIBLE" && materiel.etat === "BON_ETAT" ? (
            <Link className="button-link" to={`/client/emprunt/${materiel.id}`}>
              Emprunter ce matériel
            </Link>
          ) : (
            <p className="error-message">
              Ce matériel n’est pas disponible pour le moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailMateriel;