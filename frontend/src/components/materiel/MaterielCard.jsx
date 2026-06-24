import { Link } from "react-router-dom";

const MaterielCard = ({ materiel }) => {
  const getStatutClass = () => {
    if (materiel.statut === "DISPONIBLE") return "badge badge-success";
    if (materiel.statut === "EMPRUNTE") return "badge badge-warning";
    return "badge badge-danger";
  };

  const getEtatClass = () => {
    if (materiel.etat === "BON_ETAT") return "badge badge-success";
    return "badge badge-danger";
  };

  return (
    <div className="catalogue-card">
      {materiel.image_url ? (
      <img
        className="materiel-image"
        src={materiel.image_url}
        alt={materiel.nom}
      />
    ) : (
      <div className="materiel-image-placeholder">
        Aucune photo
      </div>
    )}
      <h3>{materiel.nom}</h3>

      <p className="catalogue-description">
        {materiel.description || "Aucune description disponible."}
      </p>

      <div className="catalogue-info">
        <p>
          <strong>Catégorie :</strong> {materiel.categorie || "Non définie"}
        </p>

        <p>
          <strong>Statut :</strong>{" "}
          <span className={getStatutClass()}>{materiel.statut}</span>
        </p>

        <p>
          <strong>État :</strong>{" "}
          <span className={getEtatClass()}>{materiel.etat}</span>
        </p>
      </div>

      <div className="catalogue-actions">
        <Link className="button-link" to={`/client/materiel/${materiel.id}`}>
          Voir détail
        </Link>
      </div>
    </div>
  );
};

export default MaterielCard;