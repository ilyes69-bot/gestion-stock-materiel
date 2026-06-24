import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      setError("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      setError("Erreur lors de la mise à jour de la notification");
    }
  };

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Mes notifications</h1>
        <p>Retrouvez les confirmations d’emprunt, retours validés et incidents.</p>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && notifications.length === 0 && (
        <p>Aucune notification pour le moment.</p>
      )}

      <div className="timeline-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`timeline-card ${
              notification.lu ? "notification-read" : "notification-unread"
            }`}
          >
            <p>
              <strong>Type :</strong>{" "}
              <span className="badge badge-muted">{notification.type}</span>
            </p>

            <p>{notification.contenu}</p>

            <p className="timeline-date">
              {new Date(notification.created_at).toLocaleString()}
            </p>

            <p>
              <strong>Statut :</strong>{" "}
              {notification.lu ? (
                <span className="badge badge-success">Lue</span>
              ) : (
                <span className="badge badge-warning">Non lue</span>
              )}
            </p>

            {!notification.lu && (
              <div className="timeline-actions">
                <button onClick={() => handleRead(notification.id)}>
                  Marquer comme lue
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;