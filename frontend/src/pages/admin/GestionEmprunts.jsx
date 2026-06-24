import { useEffect, useState } from "react";
import {
  getAllEmprunts,
  validerRetour,
  signalerEndommage,
} from "../../services/empruntService";
import {
  getEmpruntBadgeClass,
  getEmpruntLabel,
  isEmpruntEnRetard,
} from "../../utils/empruntStatus";

const GestionEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEmprunts = async () => {
    try {
      const data = await getAllEmprunts();
      setEmprunts(data);
    } catch (err) {
      setError("Erreur lors du chargement des emprunts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  const handleValiderRetour = async (id) => {
    try {
      setError("");
      setSuccess("");

      await validerRetour(id);

      setSuccess("Retour validé avec succès");
      loadEmprunts();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const handleSignalerEndommage = async (id) => {
    try {
      setError("");
      setSuccess("");

      await signalerEndommage(id);

      setSuccess("Matériel signalé comme endommagé");
      loadEmprunts();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du signalement");
    }
  };

  const getMaterielBadge = (statut) => {
    if (statut === "DISPONIBLE") return "badge badge-success";
    if (statut === "EMPRUNTE") return "badge badge-warning";
    return "badge badge-danger";
  };

  const getEtatBadge = (etat) => {
    if (etat === "BON_ETAT") return "badge badge-success";
    return "badge badge-danger";
  };

  return (
    <div className="loans-page">
      <div className="loans-header">
        <h1>Emprunts et retours</h1>
        <p>Consultez les emprunts, validez les retours ou signalez un matériel endommagé.</p>
      </div>

      {loading && <p>Chargement...</p>}

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {!loading && emprunts.length === 0 && (
        <p>Aucun emprunt trouvé.</p>
      )}

      <div className="loans-grid">
        {emprunts.map((emprunt) => (
          <div key={emprunt.id} className="loan-card">
            <div className="loan-card-header">
              <h3>{emprunt.materiels?.nom || "Matériel supprimé"}</h3>

              <span className={getEmpruntBadgeClass(emprunt)}>
                {getEmpruntLabel(emprunt)}
              </span>
            </div>

            <div className="loan-info-grid">
              <div className="loan-info-box">
                <span>Client</span>
                <strong>
                  {emprunt.users?.prenom} {emprunt.users?.nom}
                </strong>
              </div>

              <div className="loan-info-box">
                <span>Email</span>
                <strong>{emprunt.users?.email}</strong>
              </div>

              <div className="loan-info-box">
                <span>Date début</span>
                <strong>{emprunt.date_debut}</strong>
              </div>

              <div className="loan-info-box">
                <span>Date fin</span>
                <strong>{emprunt.date_fin}</strong>
              </div>

              <div className="loan-info-box">
                <span>Date retour</span>
                <strong>{emprunt.date_retour_effective || "Non retourné"}</strong>
              </div>

              <div className="loan-info-box">
                <span>Statut matériel</span>
                <span className={getMaterielBadge(emprunt.materiels?.statut)}>
                  {emprunt.materiels?.statut || "Non disponible"}
                </span>
              </div>

              <div className="loan-info-box">
                <span>État matériel</span>
                <span className={getEtatBadge(emprunt.materiels?.etat)}>
                  {emprunt.materiels?.etat || "Non renseigné"}
                </span>
              </div>
            </div>
            {isEmpruntEnRetard(emprunt) && (
              <p className="late-warning">
                Cet emprunt est en retard. Le client devait retourner le matériel avant le{" "}
                {emprunt.date_fin}.
              </p>
            )}

            {emprunt.statut === "EN_COURS" && (
              <div className="loan-actions">
                <button onClick={() => handleValiderRetour(emprunt.id)}>
                  Valider retour
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleSignalerEndommage(emprunt.id)}
                >
                  Signaler endommagé
                </button>
              </div>
            )}

            {emprunt.statut === "RETOURNE" && (
              <p className="loan-treated">Retour déjà traité</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEmprunts;