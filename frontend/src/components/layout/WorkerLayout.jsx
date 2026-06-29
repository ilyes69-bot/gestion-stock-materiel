import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const WorkerLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="worker-layout">
      <aside className="worker-sidebar">
        <div>
          <div className="worker-sidebar-header">
            <h2>Travailleur</h2>
            <p>
              {user?.prenom} {user?.nom}
            </p>
          </div>

          <nav className="worker-sidebar-nav">
            <NavLink to="/worker/scan">
              Scanner matériel
            </NavLink>

            <NavLink to="/worker/emprunts">
              Tous les emprunts
            </NavLink>
          </nav>
        </div>

        <button onClick={handleLogout} className="worker-logout-button">
          Déconnexion
        </button>
      </aside>

      <main className="worker-main">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkerLayout;