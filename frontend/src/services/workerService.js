import api from "./api";

export const scanMateriel = async (qrToken) => {
  const response = await api.get(`/worker/scan/${qrToken}`);
  return response.data;
};

export const confirmerSortie = async (empruntId) => {
  const response = await api.put(
    `/worker/emprunts/${empruntId}/confirmer-sortie`
  );
  return response.data.emprunt;
};

export const validerRetourNormal = async (empruntId) => {
  const response = await api.put(
    `/worker/emprunts/${empruntId}/retour-normal`
  );
  return response.data.emprunt;
};

export const validerRetourProbleme = async (empruntId, data) => {
  const response = await api.put(
    `/worker/emprunts/${empruntId}/retour-probleme`,
    data
  );
  return response.data.emprunt;
};
export const getWorkerEmprunts = async () => {
  const response = await api.get("/worker/emprunts");
  return response.data.emprunts || [];
};