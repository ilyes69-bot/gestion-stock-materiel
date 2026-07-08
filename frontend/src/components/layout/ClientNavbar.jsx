import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ClientNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="client-navbar">
      <Link to="/client/catalogue" className="client-navbar-logo">
        Gestion Matériel
      </Link>

      <div className="client-navbar-links">
        <Link to="/client/catalogue">Catalogue</Link>
        <Link to="/client/mes-emprunts">Mes emprunts</Link>
        <Link to="/client/panier">Panier</Link>
        <Link to="/client/notifications">Notifications</Link>

        <div className="client-navbar-dropdown">
          <button type="button" className="client-navbar-dropdown-button">
            Mes annonces ▾
          </button>

          <div className="client-navbar-dropdown-menu">
            <Link to="/client/ajouter-materiel">Ajouter matériel</Link>
            <Link to="/client/mes-materiels">Mes matériels</Link>
            <Link to="/client/demandes-recues">Demandes reçues</Link>
          </div>
        </div>

        <div className="client-navbar-dropdown">
          <button type="button" className="client-navbar-dropdown-button">
            Société ▾
          </button>

          <div className="client-navbar-dropdown-menu">
            <Link to="/client/demander-societe">Créer société</Link>
          </div>
        </div>

        <div className="client-navbar-dropdown">
          <button type="button" className="client-navbar-dropdown-button">
            Mon compte ▾
          </button>

          <div className="client-navbar-dropdown-menu">
            <Link to="/client/profil">Profil</Link>
            <Link to="/client/historique">Historique</Link>
          </div>
        </div>
      </div>

      <div className="client-navbar-user">
        <span>
          {user?.prenom} {user?.nom}
        </span>

        <button type="button" onClick={logout}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default ClientNavbar;