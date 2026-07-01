import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getDemandesRecues,
  accepterDemandeRecue,
  refuserDemandeRecue,
  confirmerRemiseMateriel,
  confirmerRetourNormalMateriel,
  confirmerRetourProblemeMateriel,
} from "../../services/proprietaireEmpruntService";

const DemandesRecues = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const data = await getDemandesRecues();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des demandes reçues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemandes();
  }, []);

  const handleAccept = async (id) => {
    try {
      await accepterDemandeRecue(id);
      toast.success("Demande acceptée avec succès.");
      loadDemandes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de l’acceptation de la demande.";
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
      await refuserDemandeRecue(id, commentaire);
      toast.success("Demande refusée avec succès.");
      loadDemandes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du refus de la demande.";
      toast.error(message);
    }
  };

  const handleConfirmHandover = async (id) => {
    const confirmation = window.confirm(
      "Confirmer que vous avez remis le matériel au client ?"
    );

    if (!confirmation) return;

    try {
      await confirmerRemiseMateriel(id);
      toast.success("Remise du matériel confirmée.");
      loadDemandes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la confirmation de remise.";
      toast.error(message);
    }
  };

  const handleReturnNormal = async (id) => {
    const confirmation = window.confirm(
      "Confirmer que le matériel a été retourné en bon état ?"
    );

    if (!confirmation) return;

    try {
      await confirmerRetourNormalMateriel(id);
      toast.success("Retour normal confirmé.");
      loadDemandes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la confirmation du retour.";
      toast.error(message);
    }
  };

  const handleReturnProblem = async (id) => {
    const commentaire = window.prompt(
      "Décrivez le problème constaté au retour :"
    );

    if (!commentaire || commentaire.trim() === "") {
      toast.error("Le commentaire est obligatoire.");
      return;
    }

    try {
      await confirmerRetourProblemeMateriel(id, {
        type_probleme_retour: "ENDOMMAGE",
        commentaire_retour: commentaire,
      });

      toast.success("Retour avec problème confirmé.");
      loadDemandes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la confirmation du retour avec problème.";
      toast.error(message);
    }
  };

  const getStatusLabel = (statut) => {
    if (statut === "EN_ATTENTE_PROPRIETAIRE") {
      return "En attente de votre réponse";
    }

    if (statut === "VALIDE_PROPRIETAIRE") {
      return "Acceptée - remise à confirmer";
    }

    if (statut === "REFUSE") {
      return "Refusée";
    }

    if (statut === "EN_COURS") {
      return "En cours - retour à confirmer";
    }

    if (statut === "RETOURNE") {
      return "Retournée";
    }

    return statut || "Non renseigné";
  };

  const getStatusClass = (statut) => {
    if (statut === "EN_ATTENTE_PROPRIETAIRE") return "badge badge-warning";
    if (statut === "VALIDE_PROPRIETAIRE") return "badge badge-info";
    if (statut === "REFUSE") return "badge badge-danger";
    if (statut === "EN_COURS") return "badge badge-warning";
    if (statut === "RETOURNE") return "badge badge-success";
    return "badge badge-muted";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="client-owner-page">
      <div className="page-header">
        <h1>Demandes reçues</h1>
        <p>
          Retrouvez ici les demandes d’emprunt reçues sur les matériels que vous
          avez proposés.
        </p>
      </div>

      {demandes.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucune demande reçue</h2>
          <p>
            Lorsqu’un utilisateur demandera à emprunter votre matériel, la
            demande apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="owner-request-grid">
          {demandes.map((demande) => (
            <div key={demande.id} className="owner-request-card">
              {demande.materiel?.image_url && (
                <img
                  src={demande.materiel.image_url}
                  alt={demande.materiel.nom}
                />
              )}

              <h2>{demande.materiel?.nom || "Matériel"}</h2>

              <span className={getStatusClass(demande.statut)}>
                {getStatusLabel(demande.statut)}
              </span>

              <div className="owner-request-info">
                <p>
                  <strong>Catégorie :</strong>{" "}
                  {demande.materiel?.categorie || "Non renseignée"}
                </p>

                <p>
                  <strong>Ville :</strong>{" "}
                  {demande.materiel?.ville || "Non renseignée"}
                </p>

                <p>
                  <strong>Prix/jour :</strong>{" "}
                  {demande.materiel?.prix_jour
                    ? `${demande.materiel.prix_jour} €`
                    : "Non renseigné"}
                </p>

                <p>
                  <strong>Date début :</strong> {demande.date_debut}
                </p>

                <p>
                  <strong>Date fin :</strong> {demande.date_fin}
                </p>
              </div>

              <div className="owner-request-client">
                <strong>Demandé par :</strong>
                <p>
                  {demande.client
                    ? `${demande.client.prenom} ${demande.client.nom}`
                    : "Client inconnu"}
                </p>
                <p>{demande.client?.email || ""}</p>
              </div>

              {demande.commentaire_refus_proprietaire && (
                <div className="owner-validation-comment">
                  <strong>Raison du refus :</strong>
                  <p>{demande.commentaire_refus_proprietaire}</p>
                </div>
              )}

              {demande.commentaire_retour && (
                <div className="owner-validation-comment">
                  <strong>Commentaire retour :</strong>
                  <p>{demande.commentaire_retour}</p>
                </div>
              )}

              {demande.statut === "EN_ATTENTE_PROPRIETAIRE" && (
                <div className="owner-request-actions">
                  <button onClick={() => handleAccept(demande.id)}>
                    Accepter
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleRefuse(demande.id)}
                  >
                    Refuser
                  </button>
                </div>
              )}

              {demande.statut === "VALIDE_PROPRIETAIRE" && (
                <div className="owner-request-actions">
                  <button onClick={() => handleConfirmHandover(demande.id)}>
                    Confirmer remise
                  </button>
                </div>
              )}

              {demande.statut === "EN_COURS" && (
                <div className="owner-request-actions">
                  <button onClick={() => handleReturnNormal(demande.id)}>
                    Retour normal
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleReturnProblem(demande.id)}
                  >
                    Retour avec problème
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

export default DemandesRecues;