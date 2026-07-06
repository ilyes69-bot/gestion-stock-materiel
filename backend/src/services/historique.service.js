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

const createHistorique = async ({
  userId,
  materielId,
  empruntId,
  typeAction,
  description,
}) => {
  const { data, error } = await supabase
    .from("historique_actions")
    .insert([
      {
        user_id: userId || null,
        materiel_id: materielId || null,
        emprunt_id: empruntId || null,
        type_action: typeAction,
        description,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getAllHistorique = async (adminId) => {
  const societeId = await getAdminSocieteId(adminId);

  const { data: actions, error } = await supabase
    .from("historique_actions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
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
      console.log("Erreur chargement users historique:", usersError);
    } else {
      users = usersData || [];
    }
  }

  if (materielIds.length > 0) {
    const { data: materielsData, error: materielsError } = await supabase
      .from("materiels")
      .select("id, nom, categorie, societe_id, proprietaire_type")
      .in("id", materielIds);

    if (materielsError) {
      console.log("Erreur chargement materiels historique:", materielsError);
    } else {
      materiels = materielsData || [];
    }
  }

  if (empruntIds.length > 0) {
    const { data: empruntsData, error: empruntsError } = await supabase
      .from("emprunts")
      .select("id, statut, date_debut, date_fin, societe_id, type_emprunt")
      .in("id", empruntIds);

    if (empruntsError) {
      console.log("Erreur chargement emprunts historique:", empruntsError);
    } else {
      emprunts = empruntsData || [];
    }
  }

  const usersMap = new Map(users.map((user) => [user.id, user]));
  const materielsMap = new Map(
    materiels.map((materiel) => [materiel.id, materiel])
  );
  const empruntsMap = new Map(
    emprunts.map((emprunt) => [emprunt.id, emprunt])
  );

  const historiqueSociete = actions
    .map((action) => {
      const user = usersMap.get(action.user_id) || null;
      const materiel = materielsMap.get(action.materiel_id) || null;
      const emprunt = empruntsMap.get(action.emprunt_id) || null;

      return {
        ...action,
        users: user,
        materiels: materiel,
        emprunts: emprunt,
      };
    })
    .filter((action) => {
      const actionUserSocieteId = action.users?.societe_id;
      const actionMaterielSocieteId = action.materiels?.societe_id;
      const actionEmpruntSocieteId = action.emprunts?.societe_id;

      return (
        actionUserSocieteId === societeId ||
        actionMaterielSocieteId === societeId ||
        actionEmpruntSocieteId === societeId
      );
    });

  return historiqueSociete;
};

const getHistoriqueByUser = async (userId) => {
  const { data, error } = await supabase
    .from("historique_actions")
    .select(`
      *,
      materiels (
        id,
        nom,
        categorie
      ),
      emprunts (
        id,
        statut,
        date_debut,
        date_fin
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  createHistorique,
  getAllHistorique,
  getHistoriqueByUser,
};