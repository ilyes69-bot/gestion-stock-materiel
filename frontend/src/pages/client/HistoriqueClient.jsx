import { useEffect, useState } from "react";
import { getMonHistorique } from "../../services/historiqueService";

const HistoriqueClient = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistorique = async () => {
    try {
      const data = await getMonHistorique();
      setHistorique(data);
    } catch (err) {
      setError("Erreur lors du chargement de l'historique");
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
        <h1>Mon historique</h1>
        <p>Consultez les actions liées à vos emprunts.</p>
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

export default HistoriqueClient;