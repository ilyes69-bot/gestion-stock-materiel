import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getToutesSocietes,
  approuverSociete,
  refuserSociete,
} from "../../services/societeService";

const GestionSocietes = () => {
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSocietes = async () => {
    try {
      setLoading(true);
      const data = await getToutesSocietes();
      setSocietes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des sociétés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocietes();
  }, []);

  const handleApprove = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous approuver cette société ? Le demandeur deviendra admin société."
    );

    if (!confirmation) return;

    try {
      await approuverSociete(id);
      toast.success("Société approuvée avec succès.");
      loadSocietes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de l’approbation de la société.";
      toast.error(message);
    }
  };

  const handleRefuse = async (id) => {
    const commentaire = window.prompt("Raison du refus :");

    if (!commentaire || commentaire.trim() === "") {
      toast.error("La raison du refus est obligatoire.");
      return;
    }

    try {
      await refuserSociete(id, commentaire);
      toast.success("Société refusée avec succès.");
      loadSocietes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du refus de la société.";
      toast.error(message);
    }
  };

  const getStatusLabel = (statut) => {
    if (statut === "EN_ATTENTE") return "En attente";
    if (statut === "APPROUVE") return "Approuvée";
    if (statut === "REFUSE") return "Refusée";
    if (statut === "BLOQUE") return "Bloquée";
    return statut || "Non renseigné";
  };

  const getStatusClass = (statut) => {
    if (statut === "EN_ATTENTE") return "badge badge-warning";
    if (statut === "APPROUVE") return "badge badge-success";
    if (statut === "REFUSE") return "badge badge-danger";
    if (statut === "BLOQUE") return "badge badge-danger";
    return "badge badge-muted";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="super-admin-page">
      <div className="page-header">
        <h1>Gestion des sociétés</h1>
        <p>
          Retrouvez ici les demandes de création de sociétés et les sociétés
          enregistrées sur la plateforme.
        </p>
      </div>

      {societes.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucune société</h2>
          <p>Aucune demande de société n’a encore été envoyée.</p>
        </div>
      ) : (
        <div className="societe-grid">
          {societes.map((societe) => (
            <div key={societe.id} className="societe-card">
              <div className="societe-card-header">
                <h2>{societe.nom}</h2>
                <span className={getStatusClass(societe.statut)}>
                  {getStatusLabel(societe.statut)}
                </span>
              </div>

              <p>
                <strong>Email :</strong>{" "}
                {societe.email || "Non renseigné"}
              </p>

              <p>
                <strong>Téléphone :</strong>{" "}
                {societe.telephone || "Non renseigné"}
              </p>

              <p>
                <strong>Adresse :</strong>{" "}
                {societe.adresse || "Non renseignée"}
              </p>

              <p>
                <strong>Description :</strong>{" "}
                {societe.description || "Aucune description"}
              </p>

              <div className="societe-user-box">
                <strong>Demandeur :</strong>
                <p>
                  {societe.demandeur
                    ? `${societe.demandeur.prenom} ${societe.demandeur.nom}`
                    : "Non renseigné"}
                </p>
                <p>{societe.demandeur?.email || ""}</p>
              </div>

              {societe.admin && (
                <div className="societe-user-box">
                  <strong>Admin société :</strong>
                  <p>
                    {societe.admin.prenom} {societe.admin.nom}
                  </p>
                  <p>{societe.admin.email}</p>
                </div>
              )}

              {societe.commentaire_validation && (
                <div className="owner-validation-comment">
                  <strong>Commentaire :</strong>
                  <p>{societe.commentaire_validation}</p>
                </div>
              )}

              {societe.statut === "EN_ATTENTE" && (
                <div className="pending-actions">
                  <button onClick={() => handleApprove(societe.id)}>
                    Approuver
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleRefuse(societe.id)}
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionSocietes;