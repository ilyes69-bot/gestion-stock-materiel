import api from "./api";

export const getTravailleursSociete = async () => {
  const response = await api.get("/societe-workers");
  return response.data.travailleurs || [];
};

export const createTravailleurSociete = async (data) => {
  const response = await api.post("/societe-workers", data);
  return response.data.travailleur;
};

export const bloquerTravailleurSociete = async (id, reason) => {
  const response = await api.put(`/societe-workers/${id}/block`, {
    reason,
  });

  return response.data.travailleur;
};

export const debloquerTravailleurSociete = async (id) => {
  const response = await api.put(`/societe-workers/${id}/unblock`);
  return response.data.travailleur;
};