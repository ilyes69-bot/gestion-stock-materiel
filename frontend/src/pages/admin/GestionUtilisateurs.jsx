import { useEffect, useState } from "react";
import {
  getUsers,
  blockUser,
  unblockUser,
} from "../../services/userService";
import toast from "react-hot-toast";

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenBlock = (userId) => {
    setSelectedUserId(userId);
    setReason("");
    setError("");
    setSuccess("");
  };

  const handleCancelBlock = () => {
    setSelectedUserId(null);
    setReason("");
  };

  const handleBlock = async (userId) => {
    if (!reason.trim()) {
      setError("Veuillez écrire une raison de blocage.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await blockUser(userId, reason);
      toast.success("Utilisateur bloqué avec succès.");

      setSuccess("Utilisateur bloqué avec succès.");
      setSelectedUserId(null);
      setReason("");

      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du blocage de l'utilisateur."
      );
      toast.error(
        err.response?.data?.message ||
            "Erreur lors du blocage de l'utilisateur."
        );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment débloquer cet utilisateur ?"
    );

    if (!confirmation) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await unblockUser(userId);
      toast.success("Utilisateur débloqué avec succès.");

      setSuccess("Utilisateur débloqué avec succès.");
      loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du déblocage de l'utilisateur."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    if (statut === "actif") return "badge badge-success";
    if (statut === "bloque") return "badge badge-danger";
    return "badge badge-muted";
  };

  const getEmailBadge = (verified) => {
    if (verified) return "badge badge-success";
    return "badge badge-warning";
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>Gestion des utilisateurs</h1>
        <p>
          Consultez les comptes clients, bloquez un utilisateur avec une raison
          ou débloquez-le si nécessaire.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {users.length === 0 && <p>Aucun utilisateur trouvé.</p>}

      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar">
                {user.prenom?.charAt(0)}
                {user.nom?.charAt(0)}
              </div>

              <div>
                <h3>
                  {user.prenom} {user.nom}
                </h3>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="user-info-grid">
              <div className="user-info-box">
                <span>Rôle</span>
                <strong>{user.role}</strong>
              </div>

              <div className="user-info-box">
                <span>Statut</span>
                <span className={getStatusBadge(user.statut_compte)}>
                  {user.statut_compte}
                </span>
              </div>

              <div className="user-info-box">
                <span>Email</span>
                <span className={getEmailBadge(user.email_verified)}>
                  {user.email_verified ? "Confirmé" : "Non confirmé"}
                </span>
              </div>

              <div className="user-info-box">
                <span>Inscription</span>
                <strong>
                  {user.date_inscription
                    ? new Date(user.date_inscription).toLocaleDateString()
                    : "Non renseignée"}
                </strong>
              </div>
            </div>

            {user.statut_compte === "bloque" && (
              <div className="ban-reason-box">
                <strong>Raison du blocage :</strong>
                <p>{user.ban_reason || "Aucune raison précisée."}</p>
              </div>
            )}

            {selectedUserId === user.id && (
              <div className="block-user-form">
                <label>Raison du blocage</label>

                <textarea
                  placeholder="Ex : Retard répété dans le retour du matériel..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>

                <div className="user-actions">
                  <button
                    className="delete-button"
                    onClick={() => handleBlock(user.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Blocage..." : "Confirmer le blocage"}
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleCancelBlock}
                    disabled={actionLoading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {selectedUserId !== user.id && (
              <div className="user-actions">
                {user.role !== "admin" && user.statut_compte !== "bloque" && (
                  <button
                    className="delete-button"
                    onClick={() => handleOpenBlock(user.id)}
                  >
                    Bloquer
                  </button>
                )}

                {user.role !== "admin" && user.statut_compte === "bloque" && (
                  <button onClick={() => handleUnblock(user.id)}>
                    Débloquer
                  </button>
                )}

                {user.role === "admin" && (
                  <span className="badge badge-muted">
                    Compte administrateur protégé
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionUtilisateurs;