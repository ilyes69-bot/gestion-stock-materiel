const supabase = require("../config/supabase");
const checkDates = require("../utils/checkDates");
const { createNotification } = require("./notification.service");
const { createHistorique } = require("./historique.service");

const createEmprunt = async ({ clientId, materielId, dateDebut, dateFin }) => {
  if (!materielId) {
    throw new Error("Le matériel est obligatoire");
  }

  checkDates(dateDebut, dateFin);

  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("id", materielId)
    .maybeSingle();

  if (materielError) {
    throw new Error(materielError.message);
  }

  if (!materiel) {
    throw new Error("Matériel introuvable");
  }

  if (materiel.statut !== "DISPONIBLE") {
    throw new Error("Ce matériel n'est pas disponible");
  }

  if (materiel.etat !== "BON_ETAT") {
    throw new Error("Ce matériel n'est pas en bon état");
  }

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .insert([
      {
        client_id: clientId,
        materiel_id: materielId,
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: "EN_COURS",
      },
    ])
    .select("*")
    .single();

  if (empruntError) {
    throw new Error(empruntError.message);
  }

  const { error: updateError } = await supabase
    .from("materiels")
    .update({
      statut: "EMPRUNTE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", materielId);

  if (updateError) {
    throw new Error(updateError.message);
  }
  await createNotification({
  userId: clientId,
  contenu: `Votre emprunt du matériel "${materiel.nom}" a été créé avec succès.`,
  type: "EMPRUNT_CREE",
});

await createHistorique({
  userId: clientId,
  materielId: materielId,
  empruntId: emprunt.id,
  typeAction: "EMPRUNT_CREE",
  description: `Le client a emprunté le matériel "${materiel.nom}".`,
});

  return emprunt;
};

const getMyEmprunts = async (clientId) => {
  const { data, error } = await supabase
    .from("emprunts")
    .select(`
      *,
      materiels (
        id,
        nom,
        description,
        categorie,
        statut,
        etat
      )
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getAllEmprunts = async () => {
  const { data, error } = await supabase
    .from("emprunts")
    .select(`
      *,
      users (
        id,
        nom,
        prenom,
        email
      ),
      materiels (
        id,
        nom,
        description,
        categorie,
        statut,
        etat
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const validerRetour = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .maybeSingle();

  if (empruntError) {
    throw new Error(empruntError.message);
  }

  if (!emprunt) {
    throw new Error("Emprunt introuvable");
  }

  if (emprunt.statut !== "EN_COURS") {
    throw new Error("Cet emprunt n'est pas en cours");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: empruntUpdated, error: updateEmpruntError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select("*")
    .single();

  if (updateEmpruntError) {
    throw new Error(updateEmpruntError.message);
  }

  const { error: updateMaterielError } = await supabase
    .from("materiels")
    .update({
      statut: "DISPONIBLE",
      etat: "BON_ETAT",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  if (updateMaterielError) {
    throw new Error(updateMaterielError.message);
  }
  await createNotification({
  userId: emprunt.client_id,
  contenu: "Votre retour de matériel a été validé avec succès.",
  type: "RETOUR_VALIDE",
});

await createHistorique({
  userId: adminId,
  materielId: emprunt.materiel_id,
  empruntId: empruntId,
  typeAction: "RETOUR_VALIDE",
  description: "L’administrateur a validé le retour du matériel.",
});

  return empruntUpdated;
};

const signalerMaterielEndommage = async (empruntId, adminId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .maybeSingle();

  if (empruntError) {
    throw new Error(empruntError.message);
  }

  if (!emprunt) {
    throw new Error("Emprunt introuvable");
  }

  if (emprunt.statut !== "EN_COURS") {
    throw new Error("Cet emprunt n'est pas en cours");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: empruntUpdated, error: updateEmpruntError } = await supabase
    .from("emprunts")
    .update({
      statut: "RETOURNE",
      date_retour_effective: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select("*")
    .single();

  if (updateEmpruntError) {
    throw new Error(updateEmpruntError.message);
  }

  const { error: updateMaterielError } = await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "ENDOMMAGE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  if (updateMaterielError) {
    throw new Error(updateMaterielError.message);
  }
    await createNotification({
    userId: emprunt.client_id,
    contenu: "Le matériel retourné a été signalé comme endommagé.",
    type: "MATERIEL_ENDOMMAGE",
  });

  await createHistorique({
    userId: adminId,
    materielId: emprunt.materiel_id,
    empruntId: empruntId,
    typeAction: "MATERIEL_ENDOMMAGE",
    description: "L’administrateur a signalé le matériel comme endommagé.",
  });

  return empruntUpdated;
};

module.exports = {
  createEmprunt,
  getMyEmprunts,
  getAllEmprunts,
  validerRetour,
  signalerMaterielEndommage,
};