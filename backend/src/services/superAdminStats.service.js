const supabase = require("../config/supabase");

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
  const totalSocietes = await countRows("societes");
  const societesEnAttente = await countRows("societes", [
    { column: "statut", value: "EN_ATTENTE" },
  ]);
  const societesApprouvees = await countRows("societes", [
    { column: "statut", value: "APPROUVE" },
  ]);
  const societesRefusees = await countRows("societes", [
    { column: "statut", value: "REFUSE" },
  ]);

  const totalUtilisateurs = await countRows("users");
  const totalClients = await countRows("users", [
    { column: "role", value: "client" },
  ]);
  const totalAdmins = await countRows("users", [
    { column: "role", value: "admin" },
  ]);
  const totalTravailleurs = await countRows("users", [
    { column: "role", value: "travailleur" },
  ]);

  const totalMateriels = await countRows("materiels");
  const materielsSociete = await countRows("materiels", [
    { column: "proprietaire_type", value: "SOCIETE" },
  ]);
  const materielsUtilisateurs = await countRows("materiels", [
    { column: "proprietaire_type", value: "UTILISATEUR" },
  ]);
  const materielsUtilisateursEnAttente = await countRows("materiels", [
    { column: "proprietaire_type", value: "UTILISATEUR" },
    { column: "statut_validation", value: "EN_ATTENTE" },
  ]);

  const totalEmprunts = await countRows("emprunts");
  const empruntsEnAttente = await countRows("emprunts", [
    { column: "statut", value: "EN_ATTENTE_VALIDATION" },
  ]);
  const empruntsValides = await countRows("emprunts", [
    { column: "statut", value: "VALIDE" },
  ]);
  const empruntsEnCours = await countRows("emprunts", [
    { column: "statut", value: "EN_COURS" },
  ]);
  const empruntsRetournes = await countRows("emprunts", [
    { column: "statut", value: "RETOURNE" },
  ]);
  const empruntsRefuses = await countRows("emprunts", [
    { column: "statut", value: "REFUSE" },
  ]);

  return {
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
};

module.exports = {
  getSuperAdminStats,
};  