const supabase = require("../config/supabase");

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

const getAllHistorique = async () => {
  const { data, error } = await supabase
    .from("historique_actions")
    .select(`
      *,
      users (
        id,
        nom,
        prenom,
        email,
        role
      ),
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
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
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