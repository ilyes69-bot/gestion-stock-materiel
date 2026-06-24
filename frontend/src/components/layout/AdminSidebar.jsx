import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <h2>Admin</h2>

      <p>
        {user?.prenom} {user?.nom}
      </p>

      <hr />

      <nav>
        <ul>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>

          <li>
            <Link to="/admin/materiels">Gestion du matériel</Link>
          </li>

          <li>
            <Link to="/admin/emprunts">Emprunts et retours</Link>
          </li>

          <li>
            <Link to="/admin/historique">Historique global</Link>
          </li>

          <li>
            <Link to="/admin/profil">Profil admin</Link>
          </li>

          <li>
            <Link to="/admin/utilisateurs">Utilisateurs</Link>
          </li>
        </ul>
      </nav>

      <hr />

      <button onClick={logout}>Déconnexion</button>
    </aside>
  );
};

export default AdminSidebar;