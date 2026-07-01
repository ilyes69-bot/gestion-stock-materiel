import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMesMaterielsClient } from "../../services/clientMaterielService";

const MesMateriels = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMateriels = async () => {
    try {
      setLoading(true);
      const data = await getMesMaterielsClient();
      setMateriels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement de vos matériels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const getValidationLabel = (statut) => {
    if (statut === "EN_ATTENTE") return "En attente de validation";
    if (statut === "APPROUVE") return "Approuvé";
    if (statut === "REFUSE") return "Refusé";
    return statut || "Non renseigné";
  };

  const getValidationClass = (statut) => {
    if (statut === "EN_ATTENTE") return "badge badge-warning";
    if (statut === "APPROUVE") return "badge badge-success";
    if (statut === "REFUSE") return "badge badge-danger";
    return "badge badge-muted";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="client-owner-page">
      <div className="page-header">
        <h1>Mes matériels</h1>
        <p>
          Retrouvez ici les matériels que vous avez proposés à la location ou à
          l’emprunt.
        </p>
      </div>

      <Link to="/client/ajouter-materiel" className="owner-add-link">
        Ajouter un matériel
      </Link>

      {materiels.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucun matériel proposé</h2>
          <p>
            Vous pouvez ajouter votre premier matériel pour qu’il soit validé
            avant affichage dans le catalogue.
          </p>
        </div>
      ) : (
        <div className="owner-material-grid">
          {materiels.map((materiel) => (
            <div key={materiel.id} className="owner-material-card">
              {materiel.image_url && (
                <img src={materiel.image_url} alt={materiel.nom} />
              )}

              <h3>{materiel.nom}</h3>

              <p>
                <strong>Catégorie :</strong>{" "}
                {materiel.categorie || "Non renseignée"}
              </p>

              <p>
                <strong>Ville :</strong> {materiel.ville || "Non renseignée"}
              </p>

              <p>
                <strong>Prix/jour :</strong>{" "}
                {materiel.prix_jour ? `${materiel.prix_jour} €` : "Non renseigné"}
              </p>

              <p>
                <strong>Statut matériel :</strong> {materiel.statut}
              </p>

              <p>
                <strong>Validation :</strong>{" "}
                <span className={getValidationClass(materiel.statut_validation)}>
                  {getValidationLabel(materiel.statut_validation)}
                </span>
              </p>

              {materiel.commentaire_validation && (
                <div className="owner-validation-comment">
                  <strong>Commentaire admin :</strong>
                  <p>{materiel.commentaire_validation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesMateriels;