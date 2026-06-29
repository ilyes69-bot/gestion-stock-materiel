import api from "./api";

export const createEmprunt = async (data) => {
  const response = await api.post("/emprunts", data);
  return response.data.emprunt;
};

export const getMesEmprunts = async () => {
  const response = await api.get("/emprunts/me");
  return response.data.emprunts || [];
};

export const getAllEmprunts = async () => {
  const response = await api.get("/emprunts");
  return response.data.emprunts || [];
};

export const validateReturn = async (id) => {
  const response = await api.put(`/emprunts/${id}/retour-valide`);
  return response.data.emprunt;
};

export const markAsDamaged = async (id, data) => {
  const response = await api.put(`/emprunts/${id}/endommage`, data);
  return response.data.emprunt;
};

// Alias pour éviter de casser les anciens imports
export const validerRetour = validateReturn;
export const signalerEndommage = markAsDamaged;