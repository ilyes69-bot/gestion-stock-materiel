import api from "./api";

export const getDemandesRecues = async () => {
  const response = await api.get("/proprietaire-emprunts/received");
  return response.data.demandes || [];
};

export const accepterDemandeRecue = async (id) => {
  const response = await api.put(`/proprietaire-emprunts/${id}/accept`);
  return response.data.demande;
};

export const refuserDemandeRecue = async (id, commentaire) => {
  const response = await api.put(`/proprietaire-emprunts/${id}/refuse`, {
    commentaire,
  });

  return response.data.demande;
};

export const confirmerRemiseMateriel = async (id) => {
  const response = await api.put(`/proprietaire-emprunts/${id}/handover`);
  return response.data.demande;
};

export const confirmerRetourNormalMateriel = async (id) => {
  const response = await api.put(`/proprietaire-emprunts/${id}/return-normal`);
  return response.data.demande;
};

export const confirmerRetourProblemeMateriel = async (id, data) => {
  const response = await api.put(
    `/proprietaire-emprunts/${id}/return-problem`,
    data
  );

  return response.data.demande;
};