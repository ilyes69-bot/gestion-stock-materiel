import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/dashboardService";
import { getAllEmprunts } from "../../services/empruntService";
import { isEmpruntEnRetard } from "../../utils/empruntStatus";

const ProfilAdmin = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({});
  const [retards, setRetards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      const [statsData, empruntsData] = await Promise.all([
        getDashboardStats(),
        getAllEmprunts(),
      ]);

      setStats(statsData);

      const totalRetards = empruntsData.filter((emprunt) =>
        isEmpruntEnRetard(emprunt)
      ).length;

      setRetards(totalRetards);
    } catch (err) {
      setError("Erreur lors du chargement du profil admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
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
  const empruntsEnCours = getValue("empruntsEnCours", "emprunts_en_cours");
  const utilisateurs = getValue("totalUsers", "totalUtilisateurs", "utilisateurs");

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <h1>Profil administrateur</h1>
        <p>Consultez vos informations et le résumé global de la plateforme.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="admin-profile-grid">
        <div className="admin-profile-card">
          <div className="admin-profile-avatar">
            {user?.prenom?.charAt(0)}
            {user?.nom?.charAt(0)}
          </div>

          <h2>
            {user?.prenom} {user?.nom}
          </h2>

          <p>{user?.email}</p>

          <span className="badge badge-warning">
            {user?.role || "admin"}
          </span>
        </div>

        <div className="admin-profile-info-card">
          <h2>Informations du compte</h2>

          <div className="admin-profile-info-list">
            <div>
              <span>Nom</span>
              <strong>{user?.nom}</strong>
            </div>

            <div>
              <span>Prénom</span>
              <strong>{user?.prenom}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>

            <div>
              <span>Rôle</span>
              <strong>{user?.role}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-stats-grid">
        <div className="admin-profile-stat-card">
          <span>Total matériels</span>
          <strong>{totalMateriels}</strong>
        </div>

        <div className="admin-profile-stat-card">
          <span>Disponibles</span>
          <strong>{disponibles}</strong>
        </div>

        <div className="admin-profile-stat-card">
          <span>Emprunts en cours</span>
          <strong>{empruntsEnCours}</strong>
        </div>

        <div className="admin-profile-stat-card danger">
          <span>Emprunts en retard</span>
          <strong>{retards}</strong>
        </div>

        <div className="admin-profile-stat-card">
          <span>Utilisateurs</span>
          <strong>{utilisateurs}</strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilAdmin;