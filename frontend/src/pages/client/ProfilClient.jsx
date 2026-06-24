import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMesEmprunts } from "../../services/empruntService";
import { isEmpruntEnRetard } from "../../utils/empruntStatus";

const ProfilClient = () => {
  const { user } = useAuth();

  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmprunts = async () => {
    try {
      const data = await getMesEmprunts();
      setEmprunts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  const totalEmprunts = emprunts.length;

  const empruntsEnCours = emprunts.filter(
    (emprunt) => emprunt.statut === "EN_COURS" && !isEmpruntEnRetard(emprunt)
  ).length;

  const empruntsRetournes = emprunts.filter(
    (emprunt) => emprunt.statut === "RETOURNE"
  ).length;

  const empruntsEnRetard = emprunts.filter((emprunt) =>
    isEmpruntEnRetard(emprunt)
  ).length;

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mon profil</h1>
        <p>Consultez vos informations personnelles et le résumé de vos emprunts.</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.prenom?.charAt(0)}
            {user?.nom?.charAt(0)}
          </div>

          <h2>
            {user?.prenom} {user?.nom}
          </h2>

          <p>{user?.email}</p>

          <span className="badge badge-muted">
            {user?.role || "client"}
          </span>
        </div>

        <div className="profile-info-card">
          <h2>Informations du compte</h2>

          <div className="profile-info-list">
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

      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span>Total emprunts</span>
          <strong>{totalEmprunts}</strong>
        </div>

        <div className="profile-stat-card">
          <span>En cours</span>
          <strong>{empruntsEnCours}</strong>
        </div>

        <div className="profile-stat-card">
          <span>Retournés</span>
          <strong>{empruntsRetournes}</strong>
        </div>

        <div className="profile-stat-card danger">
          <span>En retard</span>
          <strong>{empruntsEnRetard}</strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilClient;