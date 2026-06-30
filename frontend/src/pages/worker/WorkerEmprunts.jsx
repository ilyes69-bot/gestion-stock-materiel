import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getWorkerEmprunts } from "../../services/workerService";
import {
  getEmpruntBadgeClass,
  getEmpruntLabel,
} from "../../utils/empruntStatus";

const WorkerEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmprunts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkerEmprunts();
      setEmprunts(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors du chargement des emprunts.";

      setError(message);
      toast.error(message);
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
    const client = emprunt.client;

    if (!client) {
      return "Client inconnu";
    }

    return `${client.prenom || ""} ${client.nom || ""}`;
  };

  const getMaterielName = (emprunt) => {
    return emprunt.materiels?.nom || "Matériel inconnu";
  };

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

  if (loading) {
    return (
      <div className="worker-page">
        <p>Chargement des emprunts...</p>
      </div>
    );
  }

  return (
    <div className="worker-page">
      <div className="worker-header">
        <h1>Tous les emprunts</h1>
        <p>
          Cette page permet au travailleur de suivre les emprunts, les sorties
          confirmées et les retours des matériels.
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

      <div className="worker-emprunts-grid">
        {filteredEmprunts.map((emprunt) => (
          <div key={emprunt.id} className="worker-card">
            <h2>{getMaterielName(emprunt)}</h2>

            <p>
              <strong>Client :</strong> {getClientName(emprunt)}
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
              <strong>Date retour :</strong>{" "}
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

            {emprunt.materiels?.qr_token && emprunt.statut === "EN_COURS" && (
              <div className="worker-actions">
                <Link
                  className="worker-link-button"
                  to={`/worker/scan/${emprunt.materiels.qr_token}`}
                >
                  Scanner / gérer
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerEmprunts;