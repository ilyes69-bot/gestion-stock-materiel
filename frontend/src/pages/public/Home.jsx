import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-badge">Plateforme de gestion de matériel</div>

        <h1>Gestion de stock & prêt de matériel</h1>

        <p>
          Gérez vos équipements, vos emprunts, vos retours et vos incidents
          depuis une interface moderne, simple et sécurisée.
        </p>

        <div className="home-actions">
          <Link to="/login" className="button-link">
            Se connecter
          </Link>

          <Link to="/register" className="button-link secondary-button">
            Créer un compte
          </Link>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <div className="home-icon">📦</div>
          <h3>Gestion du stock</h3>
          <p>
            Ajoutez, modifiez et suivez chaque matériel individuellement avec
            son état et son statut.
          </p>
        </div>

        <div className="home-feature-card">
          <div className="home-icon">🔁</div>
          <h3>Suivi des emprunts</h3>
          <p>
            Les utilisateurs peuvent consulter le catalogue et emprunter les
            matériels disponibles.
          </p>
        </div>

        <div className="home-feature-card">
          <div className="home-icon">✅</div>
          <h3>Gestion des retours</h3>
          <p>
            L’administrateur peut valider les retours ou signaler un matériel
            endommagé.
          </p>
        </div>

        <div className="home-feature-card">
          <div className="home-icon">🔔</div>
          <h3>Notifications</h3>
          <p>
            Les utilisateurs sont informés des emprunts, retours et actions
            importantes.
          </p>
        </div>
      </section>

      <section className="home-explanation">
        <div className="home-section-header">
          <h2>Pourquoi cette plateforme ?</h2>
          <p>
            Dans beaucoup d’organisations, le suivi du matériel se fait encore
            manuellement. Cela peut provoquer des oublis, des pertes ou des
            retards.
          </p>
        </div>

        <div className="home-explanation-card">
          <p>
            Cette application permet de centraliser la gestion du stock, de
            suivre les emprunts en temps réel, de contrôler les retours et de
            garder un historique clair de toutes les actions.
          </p>
        </div>
      </section>

      <section className="home-steps">
        <div className="home-section-header">
          <h2>Comment ça marche ?</h2>
          <p>Un fonctionnement simple en trois étapes.</p>
        </div>

        <div className="home-steps-grid">
          <div className="home-step-card">
            <span>01</span>
            <h3>L’admin ajoute le matériel</h3>
            <p>
              Chaque équipement est enregistré avec son nom, sa catégorie, son
              statut et son état.
            </p>
          </div>

          <div className="home-step-card">
            <span>02</span>
            <h3>Le client crée un emprunt</h3>
            <p>
              Le client consulte le catalogue et choisit un matériel disponible
              pour une période donnée.
            </p>
          </div>

          <div className="home-step-card">
            <span>03</span>
            <h3>L’admin valide le retour</h3>
            <p>
              Après restitution, l’admin valide le retour ou signale un matériel
              endommagé.
            </p>
          </div>
        </div>
      </section>

      <section className="home-target">
        <div className="home-section-header">
          <h2>Pour qui ?</h2>
          <p>
            Cette solution peut être utilisée par une école, une entreprise, une
            association ou tout organisme qui prête du matériel.
          </p>
        </div>

        <div className="home-target-grid">
          <div>🎓 Écoles</div>
          <div>🏢 Entreprises</div>
          <div>🤝 Associations</div>
          <div>🧰 Services internes</div>
        </div>
      </section>

      <section className="home-final-cta">
        <h2>Prêt à gérer votre matériel plus simplement ?</h2>

        <div className="home-actions">
          <Link to="/login" className="button-link">
            Se connecter
          </Link>

          <Link to="/register" className="button-link secondary-button">
            Créer un compte
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;