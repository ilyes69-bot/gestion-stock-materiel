import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const showLoginNotifications = async () => {
    try {
      const notifications = await getMyNotifications();

      if (!Array.isArray(notifications) || notifications.length === 0) {
        return;
      }

      const unreadNotifications = notifications.filter((notification) => {
        return (
          notification.lu === false ||
          notification.is_read === false ||
          notification.read === false ||
          notification.statut === "NON_LU"
        );
      });

      unreadNotifications.slice(0, 5).forEach((notification) => {
        toast(
          notification.contenu ||
            notification.message ||
            "Nouvelle notification",
          {
            icon: "🔔",
            duration: 5000,
          }
        );
      });

      for (const notification of unreadNotifications.slice(0, 5)) {
        if (notification.id) {
          await markNotificationAsRead(notification.id);
        }
      }
    } catch (error) {
      console.log("Erreur affichage notifications login:", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token || token === "undefined" || token === "null") {
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data.token;
    const user = response.data.user;

    if (!token) {
      throw new Error("Token non reçu depuis le backend");
    }

    localStorage.setItem("token", token);
    setUser(user);

    await showLoginNotifications();

    return user;
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};