import api from "./api";

export const getMateriels = async () => {
  const response = await api.get("/materiels");

  return response.data.materiels || [];
};

export const getMaterielById = async (id) => {
  const response = await api.get(`/materiels/${id}`);

  return response.data.materiel;
};

export const createMateriel = async (formData) => {
  const response = await api.post("/materiels", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.materiel;
};

export const updateMateriel = async (id, data) => {
  const response = await api.put(`/materiels/${id}`, data);

  return response.data.materiel;
};

export const deleteMateriel = async (id) => {
  const response = await api.delete(`/materiels/${id}`);

  return response.data;
};