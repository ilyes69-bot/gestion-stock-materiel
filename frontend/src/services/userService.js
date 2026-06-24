import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data.users || [];
};

export const blockUser = async (id, reason) => {
  const response = await api.put(`/users/${id}/block`, {
    reason,
  });

  return response.data.user;
};

export const unblockUser = async (id) => {
  const response = await api.put(`/users/${id}/unblock`);
  return response.data.user;
};