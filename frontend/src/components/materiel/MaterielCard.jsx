import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { addToPanier } from "../../utils/panier";
import { useAuth } from "../../context/AuthContext";

const MaterielCard = ({ materiel }) => {
  const { user } = useAuth();

  const isMyMaterial =
    materiel.proprietaire_type === "UTILISATEUR" &&
    materiel.owner_user_id === user?.id;

  const getStatutClass = () => {
    if (materiel.statut === "DISPONIBLE") return "badge badge-success";
    if (materiel.statut === "EMPRUNTE") return "badge badge-warning";
    return "badge badge-danger";
  };

  const getEtatClass = () => {
    if (materiel.etat === "BON_ETAT") return "badge badge-success";
    return "badge badge-danger";
  };

  const getProprietaireText = () => {
    if (materiel.proprietaire_nom) {
      return `${materiel.proprietaire_label || "Proposé par"} : ${
        materiel.proprietaire_nom
      }`;
    }

    if (materiel.proprietaire_type === "SOCIETE") {
      return `Société : ${materiel.societe?.nom || "Société"}`;
    }

    const ownerName = `${materiel.owner?.prenom || ""} ${
      materiel.owner?.nom || ""
    }`.trim();

    return `Propriétaire : ${ownerName || "Utilisateur"}`;
  };

  const handleAddToPanier = () => {
    if (materiel.statut !== "DISPONIBLE" || materiel.etat !== "BON_ETAT") {
      toast.error("Ce matériel ne peut pas être ajouté au panier.");
      return;
    }

    const result = addToPanier(materiel);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
  const getCleanDescription = () => {
  if (!materiel.description) return "";

  if (materiel.description.includes("[SEED TEST STOCKMANAGER]")) {
    return "";
  }

  return materiel.description.trim();
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
        <div className="materiel-image-placeholder">Aucune photo</div>
      )}

      <h3>{materiel.nom}</h3>

      <p className="materiel-owner-name">{getProprietaireText()}</p>
        {getCleanDescription() && (
      <p className="catalogue-description">
        {getCleanDescription()}
      </p>
)}

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

      {materiel.proprietaire_type === "UTILISATEUR" ? (
        <span className="owner-type-badge user-owner">
          Matériel utilisateur
        </span>
      ) : (
        <span className="owner-type-badge company-owner">
          Matériel société
        </span>
      )}

      <div className="catalogue-actions">
        <Link className="button-link" to={`/client/materiel/${materiel.id}`}>
          Voir détail
        </Link>
      </div>

      {isMyMaterial ? (
        <div className="materiel-card-actions">
          <button type="button" className="secondary-button" disabled>
            Votre matériel
          </button>
        </div>
      ) : (
        materiel.statut === "DISPONIBLE" &&
        materiel.etat === "BON_ETAT" && (
          <div className="materiel-card-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleAddToPanier}
            >
              Ajouter au panier
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default MaterielCard;