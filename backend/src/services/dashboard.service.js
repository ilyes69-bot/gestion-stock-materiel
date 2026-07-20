const supabase = require("../config/supabase");

const statsCacheBySociete = new Map();
const pendingStatsBySociete = new Map();

const CACHE_DURATION = 30000; // 30 secondes

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
  let query = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });

  filters.forEach((filter) => {
    query = query.eq(filter.column, filter.value);
  });

  const { count, error } = await query;

  if (error) {
    console.log(`Erreur count ${table}:`, error);

    const err = new Error("Erreur lors du calcul des statistiques");
    err.status = 500;
    throw err;
  }

  return count || 0;
};

const getDashboardStats = async (adminId) => {
  const societeId = await getAdminSocieteId(adminId);
  const now = Date.now();

  const cachedStats = statsCacheBySociete.get(societeId);

  if (cachedStats && now - cachedStats.time < CACHE_DURATION) {
    return cachedStats.data;
  }

  const pendingRequest = pendingStatsBySociete.get(societeId);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = Promise.all([
    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
    ]),

    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "statut", value: "DISPONIBLE" },
    ]),

    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "statut", value: "EMPRUNTE" },
    ]),

    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "statut", value: "INDISPONIBLE" },
    ]),

    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "etat", value: "ENDOMMAGE" },
    ]),

    countRows("emprunts", [
      { column: "type_emprunt", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "statut", value: "EN_COURS" },
    ]),

    countRows("emprunts", [
      { column: "type_emprunt", value: "SOCIETE" },
      { column: "societe_id", value: societeId },
      { column: "statut", value: "RETOURNE" },
    ]),

    countRows("users", [{ column: "societe_id", value: societeId }]),
  ])
    .then(
      ([
        totalMateriels,
        materielsDisponibles,
        materielsEmpruntes,
        materielsIndisponibles,
        materielsEndommages,
        empruntsEnCours,
        empruntsRetournes,
        totalUtilisateurs,
      ]) => {
        const stats = {
          totalMateriels,
          materielsDisponibles,
          materielsEmpruntes,
          materielsIndisponibles,
          materielsEndommages,
          empruntsEnCours,
          empruntsRetournes,
          totalUtilisateurs,
        };

        statsCacheBySociete.set(societeId, {
          data: stats,
          time: Date.now(),
        });

        return stats;
      }
    )
    .finally(() => {
      pendingStatsBySociete.delete(societeId);
    });

  pendingStatsBySociete.set(societeId, request);

  return request;
};

module.exports = {
  getDashboardStats,
};