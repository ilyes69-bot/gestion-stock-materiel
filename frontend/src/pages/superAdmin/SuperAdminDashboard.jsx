import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuperAdminStats } from "../../services/superAdminStatsService";

const getTotal = (items = []) => {
  return items.reduce((sum, item) => sum + Number(item.value || 0), 0);
};

const getPercent = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((Number(value || 0) / total) * 100);
};

const DistributionCard = ({ title, subtitle, total, items = [] }) => {
  return (
    <div className="sa-distribution-card">
      <div className="sa-distribution-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="sa-distribution-total">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="sa-distribution-list">
        {items.map((item) => {
          const percent = getPercent(item.value, total);

          return (
            <div key={item.label} className="sa-distribution-item">
              <div className="sa-distribution-line-top">
                <span>{item.label}</span>
                <strong>
                  {item.value} <small>{percent}%</small>
                </strong>
              </div>

              <div className="sa-distribution-line">
                <div style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      setStats(data);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques globales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  const usersItems = stats?.usersByRole || [];
  const societesItems = stats?.societesByStatus || [];
  const materielsItems = stats?.materielsByType || [];
  const empruntsItems = stats?.empruntsByStatus || [];

  const usersTotal = getTotal(usersItems);
  const societesTotal = getTotal(societesItems);
  const materielsTotal = getTotal(materielsItems);
  const empruntsTotal = getTotal(empruntsItems);

  const kpis = [
    {
      label: "Sociétés",
      value: stats?.totalSocietes || 0,
      detail: `${stats?.societesEnAttente || 0} en attente`,
    },
    {
      label: "Utilisateurs",
      value: stats?.totalUtilisateurs || 0,
      detail: `${stats?.totalClients || 0} clients`,
    },
    {
      label: "Matériels",
      value: stats?.totalMateriels || 0,
      detail: `${stats?.materielsUtilisateursEnAttente || 0} à valider`,
    },
    {
      label: "Emprunts",
      value: stats?.totalEmprunts || 0,
      detail: `${stats?.empruntsEnCours || 0} en cours`,
    },
  ];

  return (
    <div className="super-admin-page">
      <div className="sa-hero">
        <div>
          <span className="sa-hero-badge">Super Admin</span>
          <h1>Vue globale de la plateforme</h1>
          <p>
            Suivez les sociétés, les utilisateurs, les matériels et les emprunts
            depuis un seul tableau de bord.
          </p>
        </div>

        <div className="sa-hero-actions">
          <Link to="/super-admin/societes">Sociétés</Link>
          <Link to="/super-admin/utilisateurs">Utilisateurs</Link>
        </div>
      </div>

      <div className="sa-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="sa-kpi-card">
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.detail}</p>
          </div>
        ))}
      </div>

      <div className="sa-section-title">
        <h2>Analyse globale</h2>
        <p>Vue synthétique et professionnelle de l’activité plateforme.</p>
      </div>

      <div className="sa-executive-grid">
        <div className="sa-executive-card sa-executive-main">
          <span className="sa-executive-label">État plateforme</span>
          <h3>Vue d’ensemble</h3>

          <div className="sa-executive-numbers">
            <div>
              <span>Sociétés</span>
              <strong>{stats?.totalSocietes || 0}</strong>
            </div>

            <div>
              <span>Utilisateurs</span>
              <strong>{stats?.totalUtilisateurs || 0}</strong>
            </div>

            <div>
              <span>Matériels</span>
              <strong>{stats?.totalMateriels || 0}</strong>
            </div>

            <div>
              <span>Emprunts</span>
              <strong>{stats?.totalEmprunts || 0}</strong>
            </div>
          </div>
        </div>

        <div className="sa-executive-card sa-watch-card">
          <span className="sa-executive-label">À surveiller</span>
          <h3>Actions importantes</h3>

          <div className="sa-watch-list">
            <Link to="/super-admin/societes">
              <span>Sociétés en attente</span>
              <strong>{stats?.societesEnAttente || 0}</strong>
            </Link>

            <Link to="/super-admin/materiels-en-attente">
              <span>Matériels à valider</span>
              <strong>{stats?.materielsUtilisateursEnAttente || 0}</strong>
            </Link>

            <div>
              <span>Emprunts en cours</span>
              <strong>{stats?.empruntsEnCours || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="sa-distribution-grid">
        <DistributionCard
          title="Utilisateurs"
          subtitle="Répartition par rôle"
          total={usersTotal}
          items={usersItems}
        />

        <DistributionCard
          title="Sociétés"
          subtitle="Répartition par statut"
          total={societesTotal}
          items={societesItems}
        />

        <DistributionCard
          title="Matériels"
          subtitle="Répartition par origine"
          total={materielsTotal}
          items={materielsItems}
        />

        <DistributionCard
          title="Emprunts"
          subtitle="Répartition par statut"
          total={empruntsTotal}
          items={empruntsItems}
        />
      </div>

      <div className="sa-section-title">
        <h2>Actions rapides</h2>
      </div>

      <div className="super-admin-grid">
        <div className="super-admin-card">
          <h2>Sociétés</h2>
          <p>Valider, refuser ou consulter les sociétés inscrites.</p>
          <Link to="/super-admin/societes">Gérer les sociétés</Link>
        </div>

        <div className="super-admin-card">
          <h2>Matériels utilisateurs</h2>
          <p>Valider ou refuser les matériels proposés par les clients.</p>
          <Link to="/super-admin/materiels-en-attente">
            Gérer les validations
          </Link>
        </div>

        <div className="super-admin-card">
          <h2>Utilisateurs</h2>
          <p>Voir les utilisateurs de la plateforme et gérer les abus.</p>
          <Link to="/super-admin/utilisateurs">Gérer les utilisateurs</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;