import { Link } from "react-router-dom";

const SuperAdminDashboard = () => {
  return (
    <div className="super-admin-page">
      <div className="page-header">
        <h1>Espace Super Admin</h1>
        <p>
          Gérez la plateforme StockManager, les sociétés, les utilisateurs et
          les matériels proposés par les clients.
        </p>
      </div>

      <div className="super-admin-grid">
        <div className="super-admin-card">
          <h2>Sociétés</h2>
          <p>Créer, valider ou bloquer les sociétés inscrites.</p>
          <button disabled>À venir</button>
        </div>

        <div className="super-admin-card">
          <h2>Matériels utilisateurs</h2>
          <p>Valider ou refuser les matériels proposés par les utilisateurs.</p>
          <Link to="/super-admin/materiels-en-attente">
            Gérer les validations
          </Link>
        </div>

        <div className="super-admin-card">
          <h2>Utilisateurs</h2>
          <p>Voir les utilisateurs de la plateforme et gérer les abus.</p>
          <button disabled>À venir</button>
        </div>

        <div className="super-admin-card">
          <h2>Statistiques globales</h2>
          <p>Consulter les données globales de toute la plateforme.</p>
          <button disabled>À venir</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;