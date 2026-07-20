const supabase = require("../config/supabase");

let statsCache = null;
let statsCacheTime = 0;

const CACHE_DURATION = 30000; // 30 secondes

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

const getSuperAdminStats = async () => {
  const now = Date.now();

  if (statsCache && now - statsCacheTime < CACHE_DURATION) {
    return statsCache;
  }

  const [
    totalSocietes,
    societesEnAttente,
    societesApprouvees,
    societesRefusees,

    totalUtilisateurs,
    totalClients,
    totalAdmins,
    totalTravailleurs,

    totalMateriels,
    materielsSociete,
    materielsUtilisateurs,
    materielsUtilisateursEnAttente,

    totalEmprunts,
    empruntsEnAttente,
    empruntsValides,
    empruntsEnCours,
    empruntsRetournes,
    empruntsRefuses,
  ] = await Promise.all([
    countRows("societes"),
    countRows("societes", [{ column: "statut", value: "EN_ATTENTE" }]),
    countRows("societes", [{ column: "statut", value: "APPROUVE" }]),
    countRows("societes", [{ column: "statut", value: "REFUSE" }]),

    countRows("users"),
    countRows("users", [{ column: "role", value: "client" }]),
    countRows("users", [{ column: "role", value: "admin" }]),
    countRows("users", [{ column: "role", value: "travailleur" }]),

    countRows("materiels"),
    countRows("materiels", [
      { column: "proprietaire_type", value: "SOCIETE" },
    ]),
    countRows("materiels", [
      { column: "proprietaire_type", value: "UTILISATEUR" },
    ]),
    countRows("materiels", [
      { column: "proprietaire_type", value: "UTILISATEUR" },
      { column: "statut_validation", value: "EN_ATTENTE" },
    ]),

    countRows("emprunts"),
    countRows("emprunts", [
      { column: "statut", value: "EN_ATTENTE_VALIDATION" },
    ]),
    countRows("emprunts", [{ column: "statut", value: "VALIDE" }]),
    countRows("emprunts", [{ column: "statut", value: "EN_COURS" }]),
    countRows("emprunts", [{ column: "statut", value: "RETOURNE" }]),
    countRows("emprunts", [{ column: "statut", value: "REFUSE" }]),
  ]);

  const stats = {
    totalSocietes,
    societesEnAttente,
    societesApprouvees,
    societesRefusees,

    totalUtilisateurs,
    totalClients,
    totalAdmins,
    totalTravailleurs,

    totalMateriels,
    materielsSociete,
    materielsUtilisateurs,
    materielsUtilisateursEnAttente,

    totalEmprunts,
    empruntsEnAttente,
    empruntsValides,
    empruntsEnCours,
    empruntsRetournes,
    empruntsRefuses,

    usersByRole: [
      { label: "Clients", value: totalClients },
      { label: "Admins société", value: totalAdmins },
      { label: "Travailleurs", value: totalTravailleurs },
    ],

    societesByStatus: [
      { label: "En attente", value: societesEnAttente },
      { label: "Approuvées", value: societesApprouvees },
      { label: "Refusées", value: societesRefusees },
    ],

    materielsByType: [
      { label: "Sociétés", value: materielsSociete },
      { label: "Utilisateurs", value: materielsUtilisateurs },
      { label: "En attente", value: materielsUtilisateursEnAttente },
    ],

    empruntsByStatus: [
      { label: "En attente", value: empruntsEnAttente },
      { label: "Validés", value: empruntsValides },
      { label: "En cours", value: empruntsEnCours },
      { label: "Retournés", value: empruntsRetournes },
      { label: "Refusés", value: empruntsRefuses },
    ],
  };

  statsCache = stats;
  statsCacheTime = Date.now();

  return stats;
};

module.exports = {
  getSuperAdminStats,
};