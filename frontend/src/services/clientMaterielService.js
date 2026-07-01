import api from "./api";

export const createClientMateriel = async (data) => {
  const response = await api.post("/client-materiels", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.materiel;
};

export const getMesMaterielsClient = async () => {
  const response = await api.get("/client-materiels/me");
  return response.data.materiels || [];
};

export const getMaterielsClientsEnAttente = async () => {
  const response = await api.get("/client-materiels/super-admin/pending");
  return response.data.materiels || [];
};

export const approuverMaterielClient = async (id) => {
  const response = await api.put(`/client-materiels/super-admin/${id}/approve`);
  return response.data.materiel;
};

export const refuserMaterielClient = async (id, commentaire) => {
  const response = await api.put(`/client-materiels/super-admin/${id}/refuse`, {
    commentaire,
  });

  return response.data.materiel;
};

export const getCatalogueMateriels = async () => {
  const response = await api.get("/client-materiels/catalogue");
  return response.data.materiels || [];
};