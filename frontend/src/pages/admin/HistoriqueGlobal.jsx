import { useEffect, useState } from "react";
import { getHistoriqueGlobal } from "../../services/historiqueService";

const HistoriqueGlobal = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistorique = async () => {
    try {
      const data = await getHistoriqueGlobal();
      setHistorique(data);
    } catch (err) {
      setError("Erreur lors du chargement de l'historique global");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorique();
  }, []);

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Historique global</h1>
        <p>Suivez toutes les actions importantes réalisées dans le système.</p>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && historique.length === 0 && (
        <p>Aucune action enregistrée.</p>
      )}

      <div className="timeline-list">
        {historique.map((action) => (
          <div key={action.id} className="timeline-card">
            <p>
              <strong>Action :</strong>{" "}
              <span className="badge badge-muted">{action.type_action}</span>
            </p>

            <p>
              <strong>Description :</strong> {action.description}
            </p>

            <p>
              <strong>Utilisateur :</strong>{" "}
              {action.users
                ? `${action.users.prenom} ${action.users.nom} (${action.users.role})`
                : "Non renseigné"}
            </p>

            <p>
              <strong>Matériel :</strong>{" "}
              {action.materiels?.nom || "Non concerné"}
            </p>

            <p className="timeline-date">
              {new Date(action.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoriqueGlobal;