import api from "./api";

export const getSuperAdminStats = async () => {
  const response = await api.get("/super-admin/stats");
  return response.data.stats;
};