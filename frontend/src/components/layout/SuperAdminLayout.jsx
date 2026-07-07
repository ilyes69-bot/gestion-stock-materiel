import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="super-admin-layout">
      <aside className="super-admin-sidebar">
        <div>
          <div className="super-admin-logo">
            <h2>StockManager</h2>
            <span>Super Admin</span>
          </div>

          <nav className="super-admin-menu">
            <NavLink to="/super-admin/dashboard">🏠 Dashboard</NavLink>
            <NavLink to="/super-admin/societes">🏢 Sociétés</NavLink>
            <NavLink to="/super-admin/utilisateurs">👥 Utilisateurs</NavLink>
            <NavLink to="/super-admin/materiels-en-attente">
              📦 Matériels utilisateurs
            </NavLink>
            <NavLink to="/super-admin/historique">📜 Historique</NavLink>
          </nav>
        </div>

        <div className="super-admin-user">
          <p>
            Connecté en tant que <br />
            <strong>
              {user?.prenom} {user?.nom}
            </strong>
          </p>

          <button onClick={handleLogout} className="super-admin-logout">
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="super-admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;