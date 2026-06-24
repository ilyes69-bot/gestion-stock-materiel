import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ClientNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="client-navbar">
      <div className="client-navbar-logo">
        Gestion Matériel
      </div>

      <div className="client-navbar-links">
        <Link to="/client/catalogue">Catalogue</Link>
        <Link to="/client/mes-emprunts">Mes emprunts</Link>
        <Link to="/client/notifications">Notifications</Link>
        <Link to="/client/historique">Historique</Link>
      </div>

      <div className="client-navbar-user">
        <span>
          {user?.prenom} {user?.nom}
        </span>

        <button onClick={logout}>Déconnexion</button>
      </div>
    </nav>
  );
};

export default ClientNavbar;