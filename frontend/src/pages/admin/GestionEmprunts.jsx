import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllEmprunts,
  validerDemandeEmprunt,
  refuserDemandeEmprunt,
  confirmerRetourNormalFinal,
  confirmerRetourEndommageFinal,
} from "../../services/empruntService";
import {
  getEmpruntBadgeClass,
  getEmpruntLabel,
} from "../../utils/empruntStatus";

const GestionEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDamageId, setSelectedDamageId] = useState(null);
  const [typeProbleme, setTypeProbleme] = useState("Matériel endommagé");
  const [commentaireRetour, setCommentaireRetour] = useState("");

  const loadEmprunts = async () => {
    try {
      setLoading(true);
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
    const client = emprunt.client || emprunt.users;

    if (!client) {
      return "Client inconnu";
    }

    return `${client.prenom || ""} ${client.nom || ""}`;
  };

  const getClientEmail = (emprunt) => {
    const client = emprunt.client || emprunt.users;
    return client?.email || "Email non renseigné";
  };

  const getMaterielName = (emprunt) => {
    const materiel = emprunt.materiels || emprunt.materiel;
    return materiel?.nom || "Matériel inconnu";
  };

  const handleValiderDemande = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous valider cette demande d'emprunt ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");

      await validerDemandeEmprunt(id);

      toast.success("Demande validée avec succès.");
      await loadEmprunts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la validation de la demande.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuserDemande = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous refuser cette demande d'emprunt ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");

      await refuserDemandeEmprunt(id);

      toast.success("Demande refusée avec succès.");
      await loadEmprunts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors du refus de la demande.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmerRetourNormal = async (id) => {
    const confirmation = window.confirm(
      "Confirmer définitivement ce retour en bon état ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");

      await confirmerRetourNormalFinal(id);

      toast.success("Retour normal confirmé avec succès.");
      await loadEmprunts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la confirmation du retour.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const openDamageForm = (emprunt) => {
    setSelectedDamageId(emprunt.id);
    setTypeProbleme(emprunt.type_probleme_retour || "Matériel endommagé");
    setCommentaireRetour(emprunt.commentaire_retour || "");
    setError("");
  };

  const cancelDamageForm = () => {
    setSelectedDamageId(null);
    setTypeProbleme("Matériel endommagé");
    setCommentaireRetour("");
  };

  const handleConfirmerRetourEndommage = async (id) => {
    if (!commentaireRetour.trim()) {
      toast.error("Veuillez écrire un commentaire.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await confirmerRetourEndommageFinal(id, {
        type_probleme_retour: typeProbleme,
        commentaire_retour: commentaireRetour,
      });

      toast.success("Retour endommagé confirmé avec succès.");

      setSelectedDamageId(null);
      setTypeProbleme("Matériel endommagé");
      setCommentaireRetour("");

      await loadEmprunts();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la confirmation du retour endommagé.";

      setError(message);
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }
  const filterOptions = [
      { value: "TOUS", label: "Tous" },
      { value: "EN_ATTENTE_VALIDATION", label: "En attente validation" },
      { value: "VALIDE", label: "Validé" },
      { value: "EN_COURS", label: "En cours" },
      {
        value: "EN_ATTENTE_CONFIRMATION_RETOUR",
        label: "En attente retour",
      },
      { value: "RETOURNE", label: "Retourné" },
      { value: "REFUSE", label: "Refusé" },
    ];

    const filteredEmprunts = emprunts.filter((emprunt) => {
      if (statusFilter === "TOUS") {
        return true;
      }

      return emprunt.statut === statusFilter;
  });

  return (
    <div className="admin-emprunts-page">
      <div className="page-header">
        <h1>Gestion des emprunts et retours</h1>
        <p>
          L’administrateur valide les demandes d’emprunt et confirme
          définitivement les retours après déclaration du travailleur.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}
      <div className="emprunts-filter-bar">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                statusFilter === option.value
                  ? "emprunts-filter-button active"
                  : "emprunts-filter-button"
              }
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

      {filteredEmprunts.length === 0 && <p>Aucun emprunt trouvé.</p>}

      <div className="emprunts-admin-grid">
        {filteredEmprunts.map((emprunt) => (
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
              <strong>Date retour déclarée :</strong>{" "}
              {formatDate(emprunt.date_retour_effective)}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              <span className={getEmpruntBadgeClass(emprunt)}>
                {getEmpruntLabel(emprunt)}
              </span>
            </p>

            <p>
              <strong>Sortie confirmée :</strong>{" "}
              {emprunt.sortie_confirmee ? "Oui" : "Non"}
            </p>

            {emprunt.probleme_retour && (
              <div className="admin-return-problem-box">
                <strong>Problème déclaré par le travailleur :</strong>

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
              <div className="emprunt-admin-actions">
                <button
                  onClick={() => handleValiderDemande(emprunt.id)}
                  disabled={actionLoading}
                >
                  Valider demande
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleRefuserDemande(emprunt.id)}
                  disabled={actionLoading}
                >
                  Refuser demande
                </button>
              </div>
            )}

            {emprunt.statut === "VALIDE" && (
              <p className="emprunt-admin-muted">
                Demande validée. En attente de la confirmation de sortie par le
                travailleur.
              </p>
            )}

            {emprunt.statut === "EN_COURS" && (
              <p className="emprunt-admin-muted">
                Matériel sorti. En attente du retour par le travailleur.
              </p>
            )}

            {emprunt.statut === "EN_ATTENTE_CONFIRMATION_RETOUR" && (
              <>
                <div className="emprunt-admin-actions">
                  <button
                    onClick={() => handleConfirmerRetourNormal(emprunt.id)}
                    disabled={actionLoading}
                  >
                    Confirmer retour normal
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => openDamageForm(emprunt)}
                    disabled={actionLoading}
                  >
                    Confirmer endommagé
                  </button>
                </div>

                {selectedDamageId === emprunt.id && (
                  <div className="admin-damage-form">
                    <label>Type du problème</label>

                    <select
                      value={typeProbleme}
                      onChange={(e) => setTypeProbleme(e.target.value)}
                    >
                      <option value="Matériel endommagé">
                        Matériel endommagé
                      </option>
                      <option value="Matériel cassé">Matériel cassé</option>
                      <option value="Pièce manquante">Pièce manquante</option>
                      <option value="Problème technique">
                        Problème technique
                      </option>
                      <option value="Autre">Autre</option>
                    </select>

                    <label>Commentaire final</label>

                    <textarea
                      placeholder="Exemple : Le micro ne fonctionne plus correctement..."
                      value={commentaireRetour}
                      onChange={(e) => setCommentaireRetour(e.target.value)}
                    ></textarea>

                    <div className="emprunt-admin-actions">
                      <button
                        className="delete-button"
                        onClick={() =>
                          handleConfirmerRetourEndommage(emprunt.id)
                        }
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Validation..."
                          : "Confirmer problème"}
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
              </>
            )}

            {emprunt.statut === "RETOURNE" && (
              <p className="emprunt-admin-muted">Emprunt clôturé.</p>
            )}

            {emprunt.statut === "REFUSE" && (
              <p className="emprunt-admin-muted">Demande refusée.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEmprunts;