import api from "./api";

export const createEmprunt = async (empruntData) => {
  const response = await api.post("/emprunts", empruntData);
  return response.data.data;
};

export const getMesEmprunts = async () => {
  const response = await api.get("/emprunts/me");
  return response.data.data;
};

export const getAllEmprunts = async () => {
  const response = await api.get("/emprunts");
  return response.data.data;
};

export const validerRetour = async (empruntId) => {
  const response = await api.put(`/emprunts/${empruntId}/retour-valide`);
  return response.data.data;
};

export const signalerEndommage = async (empruntId) => {
  const response = await api.put(`/emprunts/${empruntId}/endommage`);
  return response.data.data;
};