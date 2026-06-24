import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../services/dashboardService";
import { getHistoriqueGlobal } from "../../services/historiqueService";
import { getAllEmprunts } from "../../services/empruntService";
import { isEmpruntEnRetard } from "../../utils/empruntStatus";

const DashboardAdmin = () => {
  const [stats, setStats] = useState({});
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retards, setRetards] = useState(0);

  const loadDashboard = async () => {
    try {
     const [statsData, historiqueData, empruntsData] = await Promise.all([
        getDashboardStats(),
        getHistoriqueGlobal(),
        getAllEmprunts(),
      ]);

      const empruntsEnRetard = empruntsData.filter((emprunt) =>
        isEmpruntEnRetard(emprunt)
      ).length;
     
      setStats(statsData);
      setHistorique(historiqueData.slice(0, 5));
      setRetards(empruntsEnRetard);
    } catch (err) {
      setError("Erreur lors du chargement du dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getValue = (...keys) => {
    for (const key of keys) {
      if (stats[key] !== undefined && stats[key] !== null) {
        return stats[key];
      }
    }

    return 0;
  };

  const totalMateriels = getValue("totalMateriels", "total_materiels");
  const disponibles = getValue("materielsDisponibles", "disponibles");
  const empruntes = getValue("materielsEmpruntes", "empruntes");
  const indisponibles = getValue("materielsIndisponibles", "indisponibles");
  const endommages = getValue("materielsEndommages", "endommages");
  const empruntsEnCours = getValue("empruntsEnCours", "emprunts_en_cours");
  const empruntsRetournes = getValue("empruntsRetournes", "emprunts_retournes");
  const utilisateurs = getValue("totalUsers", "totalUtilisateurs", "utilisateurs");

  const kpis = [
    {
      icon: "📦",
      label: "Total matériels",
      value: totalMateriels,
    },
    {
      icon: "✅",
      label: "Disponibles",
      value: disponibles,
    },
    {
      icon: "⏳",
      label: "Empruntés",
      value: empruntes,
    },
    {
      icon: "⚠️",
      label: "Endommagés",
      value: endommages,
    },
    {
      icon: "🔁",
      label: "Emprunts en cours",
      value: empruntsEnCours,
    },
    {
      icon: "🚨",
      label: "Emprunts en retard",
      value: retards,
    },
    {
      icon: "✔️",
      label: "Retours validés",
      value: empruntsRetournes,
    },
    {
      icon: "🚫",
      label: "Indisponibles",
      value: indisponibles,
    },
    {
      icon: "👥",
      label: "Utilisateurs",
      value: utilisateurs,
    },
  ];

  const stockItems = [
    {
      label: "Disponible",
      value: disponibles,
    },
    {
      label: "Emprunté",
      value: empruntes,
    },
    {
      label: "Indisponible",
      value: indisponibles,
    },
    {
      label: "Endommagé",
      value: endommages,
    },
  ];

  const getPercent = (value) => {
    if (!totalMateriels || totalMateriels === 0) return 0;
    return Math.round((value / totalMateriels) * 100);
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <h1>Dashboard administrateur</h1>
        <p>Vue globale du stock, des emprunts et de l’activité du système.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="dashboard-kpi-card">
            <div className="dashboard-kpi-icon">{kpi.icon}</div>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <div className="dashboard-section-grid">
        <div className="dashboard-panel">
          <h2>Actions rapides</h2>

          <div className="quick-actions">
            <Link className="button-link" to="/admin/materiels/ajouter">
              + Ajouter un matériel
            </Link>

            <Link className="button-link" to="/admin/materiels">
              Gérer le matériel
            </Link>

            <Link className="button-link" to="/admin/emprunts">
              Voir les emprunts
            </Link>

            <Link className="button-link" to="/admin/historique">
              Consulter l’historique
            </Link>
          </div>
        </div>

        <div className="dashboard-panel">
          <h2>Résumé du stock</h2>

          <div className="stock-summary">
            {stockItems.map((item) => (
              <div key={item.label} className="stock-row">
                <span>{item.label}</span>

                <div className="stock-bar">
                  <div
                    className="stock-bar-fill"
                    style={{ width: `${getPercent(item.value)}%` }}
                  ></div>
                </div>

                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="dashboard-panel">
          <h2>Dernières actions</h2>

          {historique.length === 0 && (
            <p>Aucune action récente pour le moment.</p>
          )}

          <div className="recent-actions-list">
            {historique.map((action) => (
              <div key={action.id} className="recent-action-item">
                <p>
                  <strong>{action.type_action}</strong>
                </p>

                <p>{action.description}</p>

                <p className="recent-action-date">
                  {new Date(action.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;