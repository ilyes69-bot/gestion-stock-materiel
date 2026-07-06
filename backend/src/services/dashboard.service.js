const supabase = require("../config/supabase");

const getAdminSocieteId = async (adminId) => {
  const { data: admin, error } = await supabase
    .from("users")
    .select("id, role, societe_id")
    .eq("id", adminId)
    .single();

  if (error || !admin) {
    const err = new Error("Admin introuvable");
    err.status = 404;
    throw err;
  }

  if (admin.role !== "admin" || !admin.societe_id) {
    const err = new Error("Vous n'êtes pas rattaché à une société");
    err.status = 403;
    throw err;
  }

  return admin.societe_id;
};

const countRows = async (table, filters = []) => {
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  filters.forEach((filter) => {
    query = query.eq(filter.column, filter.value);
  });

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

const getDashboardStats = async (adminId) => {
  const societeId = await getAdminSocieteId(adminId);

  const totalMateriels = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
  ]);

  const materielsDisponibles = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "statut", value: "DISPONIBLE" },
  ]);

  const materielsEmpruntes = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "statut", value: "EMPRUNTE" },
  ]);

  const materielsIndisponibles = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "statut", value: "INDISPONIBLE" },
  ]);

  const materielsEndommages = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "etat", value: "ENDOMMAGE" },
  ]);

  const empruntsEnCours = await countRows("emprunts", [
    { column: "type_emprunt", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "statut", value: "EN_COURS" },
  ]);

  const empruntsRetournes = await countRows("emprunts", [
    { column: "type_emprunt", value: "SOCIETE" },
    { column: "societe_id", value: societeId },
    { column: "statut", value: "RETOURNE" },
  ]);

  const totalUtilisateurs = await countRows("users", [
    { column: "societe_id", value: societeId },
  ]);

  return {
    totalMateriels,
    materielsDisponibles,
    materielsEmpruntes,
    materielsIndisponibles,
    materielsEndommages,
    empruntsEnCours,
    empruntsRetournes,
    totalUtilisateurs,
  };
};

module.exports = {
  getDashboardStats,
};