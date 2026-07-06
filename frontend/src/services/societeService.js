import api from "./api";

export const demanderCreationSociete = async (data) => {
  const response = await api.post("/societes/request", data);
  return response.data.societe;
};

export const getToutesSocietes = async () => {
  const response = await api.get("/societes/super-admin/all");
  return response.data.societes || [];
};

export const getSocietesEnAttente = async () => {
  const response = await api.get("/societes/super-admin/pending");
  return response.data.societes || [];
};

export const approuverSociete = async (id) => {
  const response = await api.put(`/societes/super-admin/${id}/approve`);
  return response.data.societe;
};

export const refuserSociete = async (id, commentaire) => {
  const response = await api.put(`/societes/super-admin/${id}/refuse`, {
    commentaire,
  });

  return response.data.societe;
};
export const demanderSocietePublique = async (data) => {
  const response = await api.post("/societes/public-request", data);
  return response.data;
};