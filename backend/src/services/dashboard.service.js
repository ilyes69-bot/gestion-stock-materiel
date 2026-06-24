const supabase = require("../config/supabase");

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

const getDashboardStats = async () => {
  const totalMateriels = await countRows("materiels");

  const materielsDisponibles = await countRows("materiels", [
    { column: "statut", value: "DISPONIBLE" },
  ]);

  const materielsEmpruntes = await countRows("materiels", [
    { column: "statut", value: "EMPRUNTE" },
  ]);

  const materielsIndisponibles = await countRows("materiels", [
    { column: "statut", value: "INDISPONIBLE" },
  ]);

  const materielsEndommages = await countRows("materiels", [
    { column: "etat", value: "ENDOMMAGE" },
  ]);

  const empruntsEnCours = await countRows("emprunts", [
    { column: "statut", value: "EN_COURS" },
  ]);

  const empruntsRetournes = await countRows("emprunts", [
    { column: "statut", value: "RETOURNE" },
  ]);

  const totalUtilisateurs = await countRows("users");

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