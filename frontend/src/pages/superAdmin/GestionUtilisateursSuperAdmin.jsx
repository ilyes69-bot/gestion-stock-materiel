import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDialog } from "../../context/DialogContext";
import {
  getAllSuperAdminUsers,
  bloquerSuperAdminUser,
  debloquerSuperAdminUser,
} from "../../services/superAdminUserService";

const GestionUtilisateursSuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { confirmDialog, promptDialog } = useDialog();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllSuperAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBlock = async (user) => {
    const raison = await promptDialog({
      title: "Bloquer l’utilisateur",
      message: `Vous êtes sur le point de bloquer ${user.prenom} ${user.nom}.`,
      label: "Raison du blocage",
      placeholder: "Exemple : comportement abusif, non-respect des règles...",
      confirmText: "Bloquer",
      cancelText: "Annuler",
      variant: "danger",
      required: true,
    });

    if (!raison) return;

    try {
      await bloquerSuperAdminUser(user.id, raison);
      toast.success("Utilisateur bloqué avec succès.");
      loadUsers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du blocage de l'utilisateur.";
      toast.error(message);
    }
  };

  const handleUnblock = async (user) => {
    const confirmation = await confirmDialog({
      title: "Débloquer l’utilisateur",
      message: `Voulez-vous débloquer ${user.prenom} ${user.nom} ?`,
      confirmText: "Débloquer",
      cancelText: "Annuler",
    });

    if (!confirmation) return;

    try {
      await debloquerSuperAdminUser(user.id);
      toast.success("Utilisateur débloqué avec succès.");
      loadUsers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du déblocage de l'utilisateur.";
      toast.error(message);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "super_admin") return "Super admin";
    if (role === "admin") return "Admin société";
    if (role === "travailleur") return "Travailleur";
    if (role === "client") return "Client";
    return role || "Non renseigné";
  };

  const getStatusClass = (statut) => {
    if (statut === "ACTIF") return "badge badge-success";
    if (statut === "BLOQUE") return "badge badge-danger";
    return "badge badge-muted";
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

        <h1>Gestion des utilisateurs</h1>
        <p>
          Retrouvez ici tous les utilisateurs de la plateforme : clients, admins
          société et travailleurs.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucun utilisateur</h2>
          <p>Aucun utilisateur n’est encore inscrit.</p>
        </div>
      ) : (
        <div className="super-admin-table-wrapper">
          <table className="super-admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Société</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>
                      {user.prenom} {user.nom}
                    </strong>
                  </td>

                  <td>{user.email}</td>

                  <td>{getRoleLabel(user.role)}</td>

                  <td>{user.societe?.nom || "Aucune"}</td>

                  <td>
                    <span className={getStatusClass(user.statut_compte)}>
                      {user.statut_compte || "Non renseigné"}
                    </span>
                  </td>

                  <td>
                    {user.date_inscription
                      ? new Date(user.date_inscription).toLocaleDateString()
                      : "Non renseignée"}
                  </td>

                  <td>
                    {user.role === "super_admin" ? (
                      <span className="super-admin-muted-action">Protégé</span>
                    ) : user.statut_compte === "BLOQUE" ? (
                      <button
                        className="super-admin-small-btn"
                        onClick={() => handleUnblock(user)}
                      >
                        Débloquer
                      </button>
                    ) : (
                      <button
                        className="super-admin-small-btn danger"
                        onClick={() => handleBlock(user)}
                      >
                        Bloquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionUtilisateursSuperAdmin;