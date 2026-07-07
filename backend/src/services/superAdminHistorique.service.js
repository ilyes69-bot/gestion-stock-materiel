const supabase = require("../config/supabase");

const getHistoriqueGlobalSuperAdmin = async () => {
  const { data: actions, error } = await supabase
    .from("historique_actions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getHistoriqueGlobalSuperAdmin:", error);

    const err = new Error("Erreur lors du chargement de l'historique global");
    err.status = 500;
    throw err;
  }

  if (!actions || actions.length === 0) {
    return [];
  }

  const userIds = [
    ...new Set(actions.map((action) => action.user_id).filter(Boolean)),
  ];

  const materielIds = [
    ...new Set(actions.map((action) => action.materiel_id).filter(Boolean)),
  ];

  const empruntIds = [
    ...new Set(actions.map((action) => action.emprunt_id).filter(Boolean)),
  ];

  let users = [];
  let materiels = [];
  let emprunts = [];

  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, nom, prenom, email, role, societe_id")
      .in("id", userIds);

    if (usersError) {
      console.log("Erreur chargement users historique global:", usersError);
    } else {
      users = usersData || [];
    }
  }

  if (materielIds.length > 0) {
    const { data: materielsData, error: materielsError } = await supabase
      .from("materiels")
      .select("id, nom, categorie, proprietaire_type, societe_id, owner_user_id")
      .in("id", materielIds);

    if (materielsError) {
      console.log("Erreur chargement materiels historique global:", materielsError);
    } else {
      materiels = materielsData || [];
    }
  }

  if (empruntIds.length > 0) {
    const { data: empruntsData, error: empruntsError } = await supabase
      .from("emprunts")
      .select(
        "id, statut, type_emprunt, client_id, materiel_id, societe_id, date_debut, date_fin, created_at"
      )
      .in("id", empruntIds);

    if (empruntsError) {
      console.log("Erreur chargement emprunts historique global:", empruntsError);
    } else {
      emprunts = empruntsData || [];
    }
  }

  const societeIds = [
    ...new Set([
      ...users.map((user) => user.societe_id).filter(Boolean),
      ...materiels.map((materiel) => materiel.societe_id).filter(Boolean),
      ...emprunts.map((emprunt) => emprunt.societe_id).filter(Boolean),
    ]),
  ];

  let societes = [];

  if (societeIds.length > 0) {
    const { data: societesData, error: societesError } = await supabase
      .from("societes")
      .select("id, nom, statut")
      .in("id", societeIds);

    if (societesError) {
      console.log("Erreur chargement sociétés historique global:", societesError);
    } else {
      societes = societesData || [];
    }
  }

  const usersMap = new Map(users.map((user) => [user.id, user]));
  const materielsMap = new Map(
    materiels.map((materiel) => [materiel.id, materiel])
  );
  const empruntsMap = new Map(
    emprunts.map((emprunt) => [emprunt.id, emprunt])
  );
  const societesMap = new Map(
    societes.map((societe) => [societe.id, societe])
  );

  return actions.map((action) => {
    const user = usersMap.get(action.user_id) || null;
    const materiel = materielsMap.get(action.materiel_id) || null;
    const emprunt = empruntsMap.get(action.emprunt_id) || null;

    const societeId =
      emprunt?.societe_id || materiel?.societe_id || user?.societe_id || null;

    const societe = societeId ? societesMap.get(societeId) || null : null;

    return {
      ...action,
      user,
      users: user,
      materiel,
      materiels: materiel,
      emprunt,
      emprunts: emprunt,
      societe,
    };
  });
};

module.exports = {
  getHistoriqueGlobalSuperAdmin,
};