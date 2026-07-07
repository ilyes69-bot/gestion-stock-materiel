import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getHistoriqueGlobalSuperAdmin } from "../../services/superAdminHistoriqueService";

const HistoriqueGlobalSuperAdmin = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadHistorique = async () => {
    try {
      setLoading(true);
      const data = await getHistoriqueGlobalSuperAdmin();
      setHistorique(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement de l’historique global.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorique();
  }, []);

  const typesActions = useMemo(() => {
    const types = historique
      .map((item) => item.type_action)
      .filter(Boolean);

    return ["ALL", ...new Set(types)];
  }, [historique]);

  const historiqueFiltre = useMemo(() => {
    return historique.filter((action) => {
      const userName = action.user
        ? `${action.user.prenom || ""} ${action.user.nom || ""} ${action.user.email || ""}`
        : "";

      const materielName = action.materiel?.nom || "";
      const societeName = action.societe?.nom || "";
      const description = action.description || "";
      const typeAction = action.type_action || "";

      const searchText = `
        ${userName}
        ${materielName}
        ${societeName}
        ${description}
        ${typeAction}
      `.toLowerCase();

      const matchSearch = searchText.includes(search.toLowerCase());
      const matchType =
        typeFilter === "ALL" || action.type_action === typeFilter;

      return matchSearch && matchType;
    });
  }, [historique, search, typeFilter]);

  const formatDate = (date) => {
    if (!date) return "Non renseignée";

    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAction = (type) => {
    if (!type) return "Action";

    return type
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="super-admin-page">
      <div className="page-header">
        <Link to="/super-admin/dashboard" className="super-admin-back-btn">
          ← Retour dashboard
        </Link>

        <h1>Historique global</h1>
        <p>
          Consultez toutes les actions réalisées sur la plateforme : emprunts,
          validations, refus, retours, matériels et actions utilisateurs.
        </p>
      </div>

      <div className="sa-history-filters">
        <input
          type="text"
          placeholder="Rechercher une action, un utilisateur, une société..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          {typesActions.map((type) => (
            <option key={type} value={type}>
              {type === "ALL" ? "Tous les types" : formatAction(type)}
            </option>
          ))}
        </select>
      </div>

      {historiqueFiltre.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucune action trouvée</h2>
          <p>Aucune action ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="sa-history-list">
          {historiqueFiltre.map((action) => (
            <div key={action.id} className="sa-history-card">
              <div className="sa-history-top">
                <div>
                  <span className="sa-history-type">
                    {formatAction(action.type_action)}
                  </span>

                  <h3>{action.description || "Action sans description"}</h3>
                </div>

                <span className="sa-history-date">
                  {formatDate(action.created_at)}
                </span>
              </div>

              <div className="sa-history-details">
                <div>
                  <span>Utilisateur</span>
                  <strong>
                    {action.user
                      ? `${action.user.prenom || ""} ${action.user.nom || ""}`
                      : "Non renseigné"}
                  </strong>
                  <p>{action.user?.email || ""}</p>
                </div>

                <div>
                  <span>Société</span>
                  <strong>{action.societe?.nom || "Aucune"}</strong>
                  <p>{action.societe?.statut || ""}</p>
                </div>

                <div>
                  <span>Matériel</span>
                  <strong>{action.materiel?.nom || "Non renseigné"}</strong>
                  <p>{action.materiel?.categorie || ""}</p>
                </div>

                <div>
                  <span>Emprunt</span>
                  <strong>{action.emprunt?.statut || "Non lié"}</strong>
                  <p>{action.emprunt?.type_emprunt || ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoriqueGlobalSuperAdmin;
