import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  scanMateriel,
  confirmerSortie,
  validerRetourNormal,
  validerRetourProbleme,
} from "../../services/workerService";

const WorkerScan = () => {
  const { qrToken } = useParams();

  const [materiel, setMateriel] = useState(null);
  const [emprunt, setEmprunt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showProblemForm, setShowProblemForm] = useState(false);
  const [typeProbleme, setTypeProbleme] = useState("Matériel endommagé");
  const [commentaireRetour, setCommentaireRetour] = useState("");

  const loadScan = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await scanMateriel(qrToken);

      setMateriel(data.materiel);
      setEmprunt(data.emprunt);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors du scan du matériel.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScan();
  }, [qrToken]);

  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "Non confirmée";
    return new Date(date).toLocaleString();
  };

  const getClientName = () => {
    const client = emprunt?.users || emprunt?.client;

    if (!client) {
      return "Client inconnu";
    }

    return `${client.prenom || ""} ${client.nom || ""}`;
  };

  const handleConfirmSortie = async () => {
    if (!emprunt?.id) return;

    try {
      setActionLoading(true);
      setError("");

      await confirmerSortie(emprunt.id);

      toast.success("Sortie confirmée avec succès.");
      await loadScan();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la confirmation de sortie.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetourNormal = async () => {
    if (!emprunt?.id) return;

    const confirmation = window.confirm(
      "Confirmer le retour normal de ce matériel ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");

      await validerRetourNormal(emprunt.id);

      toast.success("Retour normal validé avec succès.");
      await loadScan();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la validation du retour.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetourProbleme = async () => {
    if (!emprunt?.id) return;

    if (!commentaireRetour.trim()) {
      toast.error("Veuillez écrire un commentaire.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await validerRetourProbleme(emprunt.id, {
        type_probleme_retour: typeProbleme,
        commentaire_retour: commentaireRetour,
      });

      toast.success("Retour avec problème validé.");
      setShowProblemForm(false);
      setTypeProbleme("Matériel endommagé");
      setCommentaireRetour("");

      await loadScan();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors du signalement du problème.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="worker-page">
        <p>Chargement du matériel scanné...</p>
      </div>
    );
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Scan du matériel</h1>
        <p>
          Cette page permet au travailleur de contrôler la sortie et le retour
          du matériel grâce au QR code.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {!materiel && !error && (
        <p>Aucun matériel trouvé avec ce QR code.</p>
      )}

      {materiel && (
        <div className="worker-card">
          <h2>{materiel.nom}</h2>

          <p>
            <strong>Catégorie :</strong>{" "}
            {materiel.categorie || "Non renseignée"}
          </p>

          <p>
            <strong>Statut matériel :</strong> {materiel.statut}
          </p>

          <p>
            <strong>État matériel :</strong> {materiel.etat}
          </p>

          {materiel.description && (
            <p>
              <strong>Description :</strong> {materiel.description}
            </p>
          )}

          {materiel.image_url && (
            <img
              src={materiel.image_url}
              alt={materiel.nom}
              className="worker-materiel-image"
            />
          )}
        </div>
      )}

      {materiel && !emprunt && (
        <div className="worker-info-box">
          <h3>Aucun emprunt en cours</h3>
          <p>
            Ce matériel n’a actuellement aucun emprunt en cours. Il peut être
            disponible ou déjà retourné.
          </p>
        </div>
      )}

      {emprunt && (
        <div className="worker-card">
          <h2>Emprunt lié au matériel</h2>

          <p>
            <strong>Client :</strong> {getClientName()}
          </p>

          <p>
            <strong>Email :</strong>{" "}
            {emprunt.client?.email || "Non renseigné"}
          </p>

          <p>
            <strong>Date début :</strong> {formatDate(emprunt.date_debut)}
          </p>

          <p>
            <strong>Date fin :</strong> {formatDate(emprunt.date_fin)}
          </p>

          <p>
            <strong>Statut emprunt :</strong> {emprunt.statut}
          </p>

          <p>
            <strong>Sortie confirmée :</strong>{" "}
            {emprunt.sortie_confirmee ? "Oui" : "Non"}
          </p>

          <p>
            <strong>Date sortie effective :</strong>{" "}
            {formatDateTime(emprunt.date_sortie_effective)}
          </p>

          {emprunt.probleme_retour && (
            <div className="worker-problem-box">
              <strong>Problème signalé :</strong>

              <p>
                <span>Type :</span>{" "}
                {emprunt.type_probleme_retour || "Non renseigné"}
              </p>

              <p>
                <span>Commentaire :</span>{" "}
                {emprunt.commentaire_retour || "Aucun commentaire"}
              </p>
            </div>
          )}

          {emprunt.statut === "EN_ATTENTE_VALIDATION" && (
                <p className="worker-muted">
                    Cette demande attend encore la validation de l’administrateur.
                </p>
                )}

                {emprunt.statut === "VALIDE" && (
                <div className="worker-actions">
                    <button
                    onClick={handleConfirmSortie}
                    disabled={actionLoading}
                    >
                    {actionLoading ? "Validation..." : "Confirmer sortie"}
                    </button>
                </div>
                )}

                {emprunt.statut === "EN_COURS" && (
                <div className="worker-actions">
                    <button
                    onClick={handleRetourNormal}
                    disabled={actionLoading}
                    >
                    Retour normal
                    </button>

                    <button
                    className="delete-button"
                    onClick={() => setShowProblemForm(true)}
                    disabled={actionLoading}
                    >
                    Retour avec problème
                    </button>
                </div>
                )}

                {emprunt.statut === "EN_ATTENTE_CONFIRMATION_RETOUR" && (
                <p className="worker-muted">
                    Le retour a été déclaré. En attente de confirmation finale par
                    l’administrateur.
                </p>
                )}

                {emprunt.statut === "RETOURNE" && (
                <p className="worker-muted">
                    Cet emprunt est déjà clôturé.
                </p>
                )}

                {emprunt.statut === "REFUSE" && (
                <p className="worker-muted">
                    Cette demande d’emprunt a été refusée.
                </p>
                )}

          {showProblemForm && (
            <div className="worker-problem-form">
              <label>Type du problème</label>

              <select
                value={typeProbleme}
                onChange={(e) => setTypeProbleme(e.target.value)}
              >
                <option value="Matériel endommagé">Matériel endommagé</option>
                <option value="Matériel cassé">Matériel cassé</option>
                <option value="Pièce manquante">Pièce manquante</option>
                <option value="Problème technique">Problème technique</option>
                <option value="Autre">Autre</option>
              </select>

              <label>Commentaire</label>

              <textarea
                placeholder="Exemple : Le micro ne fonctionne plus correctement..."
                value={commentaireRetour}
                onChange={(e) => setCommentaireRetour(e.target.value)}
              ></textarea>

              <div className="worker-actions">
                <button
                  className="delete-button"
                  onClick={handleRetourProbleme}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Validation..." : "Confirmer problème"}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => setShowProblemForm(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerScan;