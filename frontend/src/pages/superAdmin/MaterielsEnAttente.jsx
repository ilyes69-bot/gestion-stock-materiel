import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMaterielsClientsEnAttente,
  approuverMaterielClient,
  refuserMaterielClient,
} from "../../services/clientMaterielService";

const MaterielsEnAttente = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMateriels = async () => {
    try {
      setLoading(true);
      const data = await getMaterielsClientsEnAttente();
      setMateriels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des matériels en attente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approuverMaterielClient(id);
      toast.success("Matériel approuvé avec succès.");
      setMateriels((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Erreur lors de l’approbation du matériel.");
    }
  };

  const handleRefuse = async (id) => {
    const commentaire = window.prompt("Raison du refus :");

    if (!commentaire || commentaire.trim() === "") {
      toast.error("La raison du refus est obligatoire.");
      return;
    }

    try {
      await refuserMaterielClient(id, commentaire);
      toast.success("Matériel refusé avec succès.");
      setMateriels((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Erreur lors du refus du matériel.");
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="super-admin-page">
      <div className="page-header">
        <h1>Matériels utilisateurs en attente</h1>
        <p>
          Validez ou refusez les matériels proposés par les utilisateurs avant
          leur affichage dans le catalogue.
        </p>
      </div>

      {materiels.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucun matériel en attente</h2>
          <p>Tous les matériels proposés ont déjà été traités.</p>
        </div>
      ) : (
        <div className="pending-material-grid">
          {materiels.map((materiel) => (
            <div key={materiel.id} className="pending-material-card">
              {materiel.image_url && (
                <img src={materiel.image_url} alt={materiel.nom} />
              )}

              <h2>{materiel.nom}</h2>

              <p>
                <strong>Catégorie :</strong>{" "}
                {materiel.categorie || "Non renseignée"}
              </p>

              <p>
                <strong>Ville :</strong> {materiel.ville || "Non renseignée"}
              </p>

              <p>
                <strong>Prix/jour :</strong>{" "}
                {materiel.prix_jour
                  ? `${materiel.prix_jour} €`
                  : "Non renseigné"}
              </p>

              <p>
                <strong>Description :</strong>{" "}
                {materiel.description || "Aucune description"}
              </p>

              <div className="pending-owner-box">
                <strong>Proposé par :</strong>
                <p>
                  {materiel.owner
                    ? `${materiel.owner.prenom} ${materiel.owner.nom}`
                    : "Utilisateur inconnu"}
                </p>
                <p>{materiel.owner?.email || ""}</p>
              </div>

              <div className="pending-actions">
                <button onClick={() => handleApprove(materiel.id)}>
                  Approuver
                </button>

                <button
                  className="danger-button"
                  onClick={() => handleRefuse(materiel.id)}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterielsEnAttente;