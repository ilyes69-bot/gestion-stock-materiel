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

export const validerDemandeEmprunt = async (id) => {
  const response = await api.put(`/emprunts/${id}/valider-demande`);
  return response.data.emprunt;
};

export const refuserDemandeEmprunt = async (id) => {
  const response = await api.put(`/emprunts/${id}/refuser-demande`);
  return response.data.emprunt;
};

export const confirmerRetourNormalFinal = async (id) => {
  const response = await api.put(`/emprunts/${id}/confirmer-retour-normal`);
  return response.data.emprunt;
};

export const confirmerRetourEndommageFinal = async (id, data) => {
  const response = await api.put(
    `/emprunts/${id}/confirmer-retour-endommage`,
    data
  );
  return response.data.emprunt;
};

// Anciennes fonctions gardées pour éviter de casser d'autres imports
export const validateReturn = async (id) => {
  const response = await api.put(`/emprunts/${id}/retour-valide`);
  return response.data.emprunt;
};

export const markAsDamaged = async (id, data) => {
  const response = await api.put(`/emprunts/${id}/endommage`, data);
  return response.data.emprunt;
};

export const validerRetour = validateReturn;
export const signalerEndommage = markAsDamaged;