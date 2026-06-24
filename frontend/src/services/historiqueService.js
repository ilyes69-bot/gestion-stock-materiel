import api from "./api";

export const getHistoriqueGlobal = async () => {
  const response = await api.get("/historique");
  return response.data.data;
};

export const getMonHistorique = async () => {
  const response = await api.get("/historique/me");
  return response.data.data;
};