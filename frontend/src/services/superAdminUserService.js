import api from "./api";

export const getAllSuperAdminUsers = async () => {
  const response = await api.get("/super-admin/users");
  return response.data.users || [];
};

export const bloquerSuperAdminUser = async (id, raison) => {
  const response = await api.put(`/super-admin/users/${id}/block`, {
    raison,
  });

  return response.data.user;
};

export const debloquerSuperAdminUser = async (id) => {
  const response = await api.put(`/super-admin/users/${id}/unblock`);
  return response.data.user;
};