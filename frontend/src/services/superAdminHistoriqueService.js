import api from "./api";

export const getHistoriqueGlobalSuperAdmin = async () => {
  const response = await api.get("/super-admin/historique");
  return response.data.historique || [];
};