import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllEmprunts,
  validateReturn,
  markAsDamaged,
} from "../../services/empruntService";
import {
  getEmpruntBadgeClass,
  getEmpruntLabel,
} from "../../utils/empruntStatus";

const GestionEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDamageId, setSelectedDamageId] = useState(null);
  const [typeProbleme, setTypeProbleme] = useState("Matériel endommagé");
  const [commentaireRetour, setCommentaireRetour] = useState("");

  const loadEmprunts = async () => {
    try {
      const data = await getAllEmprunts();
      setEmprunts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erreur lors du chargement des emprunts.");
      toast.error("Erreur lors du chargement des emprunts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString();
  };

  const getClientName = (emprunt) => {
    const client = emprunt.users || emprunt.client;

    if (!client) {
      return "Client inconnu";
    }

    return `${client.prenom || ""} ${client.nom || ""}`;
  };

  const getClientEmail = (emprunt) => {
    const client = emprunt.users || emprunt.client;
    return client?.email || "Email non renseigné";
  };

  const getMaterielName = (emprunt) => {
    const materiel = emprunt.materiels || emprunt.materiel;
    return materiel?.nom || "Matériel inconnu";
  };

  const handleValidateReturn = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment valider ce retour ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");

      await validateReturn(id);

      toast.success("Retour validé avec succès.");
      await loadEmprunts();
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

  const openDamageForm = (id) => {
    setSelectedDamageId(id);
    setTypeProbleme("Matériel endommagé");
    setCommentaireRetour("");
    setError("");
  };

  const cancelDamageForm = () => {
    setSelectedDamageId(null);
    setTypeProbleme("Matériel endommagé");
    setCommentaireRetour("");
  };

  const handleMarkAsDamaged = async (id) => {
    if (!commentaireRetour.trim()) {
      toast.error("Veuillez écrire un commentaire.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await markAsDamaged(id, {
        type_probleme_retour: typeProbleme,
        commentaire_retour: commentaireRetour,
      });

      toast.success("Matériel signalé comme endommagé.");

      setSelectedDamageId(null);
      setTypeProbleme("Matériel endommagé");
      setCommentaireRetour("");

      await loadEmprunts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors du signalement du matériel endommagé.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="admin-emprunts-page">
      <div className="page-header">
        <h1>Gestion des emprunts</h1>
        <p>
          Consultez les emprunts, validez les retours normaux ou signalez les
          matériels endommagés avec un commentaire.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      {emprunts.length === 0 && <p>Aucun emprunt trouvé.</p>}

      <div className="emprunts-admin-grid">
        {emprunts.map((emprunt) => (
          <div key={emprunt.id} className="emprunt-admin-card">
            <h3>{getMaterielName(emprunt)}</h3>

            <p>
              <strong>Client :</strong> {getClientName(emprunt)}
            </p>

            <p>
              <strong>Email :</strong> {getClientEmail(emprunt)}
            </p>

            <p>
              <strong>Date début :</strong> {formatDate(emprunt.date_debut)}
            </p>

            <p>
              <strong>Date fin :</strong> {formatDate(emprunt.date_fin)}
            </p>

            <p>
              <strong>Date retour :</strong>{" "}
              {formatDate(emprunt.date_retour_effective)}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              <span className={getEmpruntBadgeClass(emprunt)}>
                {getEmpruntLabel(emprunt)}
              </span>
            </p>

            {emprunt.probleme_retour && (
              <div className="admin-return-problem-box">
                <strong>Problème de retour :</strong>

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

            {selectedDamageId === emprunt.id && (
              <div className="admin-damage-form">
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

                <label>Commentaire du retour</label>

                <textarea
                  placeholder="Exemple : La table DJ ne s'allume plus, câble d'alimentation abîmé..."
                  value={commentaireRetour}
                  onChange={(e) => setCommentaireRetour(e.target.value)}
                ></textarea>

                <div className="emprunt-admin-actions">
                  <button
                    className="delete-button"
                    onClick={() => handleMarkAsDamaged(emprunt.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Validation..." : "Confirmer problème"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={cancelDamageForm}
                    disabled={actionLoading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {emprunt.statut === "EN_COURS" &&
              selectedDamageId !== emprunt.id && (
                <div className="emprunt-admin-actions">
                  <button
                    onClick={() => handleValidateReturn(emprunt.id)}
                    disabled={actionLoading}
                  >
                    Valider retour
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => openDamageForm(emprunt.id)}
                    disabled={actionLoading}
                  >
                    Signaler endommagé
                  </button>
                </div>
              )}

            {emprunt.statut === "RETOURNE" && (
              <p className="emprunt-admin-muted">
                Cet emprunt est déjà clôturé.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEmprunts;