const supabase = require("../config/supabase");

const getWorkerSocieteId = async (workerId) => {
  const { data: worker, error } = await supabase
    .from("users")
    .select("id, role, societe_id")
    .eq("id", workerId)
    .single();

  if (error || !worker) {
    const err = new Error("Travailleur introuvable");
    err.status = 404;
    throw err;
  }

  if (worker.role !== "travailleur" || !worker.societe_id) {
    const err = new Error("Vous n'êtes pas rattaché à une société");
    err.status = 403;
    throw err;
  }

  return worker.societe_id;
};

const enrichEmprunts = async (emprunts) => {
  if (!emprunts || emprunts.length === 0) return [];

  const clientIds = [...new Set(emprunts.map((e) => e.client_id).filter(Boolean))];
  const materielIds = [...new Set(emprunts.map((e) => e.materiel_id).filter(Boolean))];

  const { data: clients, error: clientsError } = await supabase
    .from("users")
    .select("id, nom, prenom, email")
    .in("id", clientIds);

  if (clientsError) {
    console.log("Erreur enrichEmprunts clients:", clientsError);
  }

  const { data: materiels, error: materielsError } = await supabase
    .from("materiels")
    .select("*")
    .in("id", materielIds);

  if (materielsError) {
    console.log("Erreur enrichEmprunts materiels:", materielsError);
  }

  const clientsMap = {};
  (clients || []).forEach((client) => {
    clientsMap[client.id] = client;
  });

  const materielsMap = {};
  (materiels || []).forEach((materiel) => {
    materielsMap[materiel.id] = materiel;
  });

  return emprunts.map((emprunt) => ({
    ...emprunt,
    client: clientsMap[emprunt.client_id] || null,
    materiel: materielsMap[emprunt.materiel_id] || null,
  }));
};

const getWorkerEmprunts = async (workerId) => {
  const societeId = await getWorkerSocieteId(workerId);

  const { data: emprunts, error } = await supabase
    .from("emprunts")
    .select("*")
    .eq("type_emprunt", "SOCIETE")
    .eq("societe_id", societeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Erreur getWorkerEmprunts:", error);

    const err = new Error("Erreur lors du chargement des emprunts travailleur");
    err.status = 500;
    throw err;
  }

  if (!emprunts || emprunts.length === 0) {
    return [];
  }

  const clientIds = [
    ...new Set(emprunts.map((emprunt) => emprunt.client_id).filter(Boolean)),
  ];

  const materielIds = [
    ...new Set(emprunts.map((emprunt) => emprunt.materiel_id).filter(Boolean)),
  ];

  let clients = [];
  let materiels = [];

  if (clientIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, nom, prenom, email")
      .in("id", clientIds);

    clients = usersData || [];
  }

  if (materielIds.length > 0) {
    const { data: materielsData } = await supabase
      .from("materiels")
      .select("id, nom, categorie, statut, etat, image_url, societe_id")
      .in("id", materielIds);

    materiels = materielsData || [];
  }

  const clientsMap = new Map(clients.map((client) => [client.id, client]));
  const materielsMap = new Map(
    materiels.map((materiel) => [materiel.id, materiel])
  );

  return emprunts.map((emprunt) => {
    const client = clientsMap.get(emprunt.client_id) || null;
    const materiel = materielsMap.get(emprunt.materiel_id) || null;

    return {
      ...emprunt,
      client,
      materiel,
      users: client,
      materiels: materiel,
    };
  });
};

const scanMaterielByQr = async (workerId, qrToken) => {
  const societeId = await getWorkerSocieteId(workerId);

  const { data: materiel, error: materielError } = await supabase
    .from("materiels")
    .select("*")
    .eq("qr_token", qrToken)
    .single();

  if (materielError || !materiel) {
    const error = new Error("Matériel introuvable");
    error.status = 404;
    throw error;
  }

  if (materiel.proprietaire_type !== "SOCIETE") {
    const error = new Error(
      "Ce matériel appartient à un utilisateur. Il ne peut pas être géré par un travailleur."
    );
    error.status = 400;
    throw error;
  }

  if (materiel.societe_id !== societeId) {
    const error = new Error(
      "Vous ne pouvez pas scanner un matériel d'une autre société."
    );
    error.status = 403;
    throw error;
  }

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("materiel_id", materiel.id)
    .eq("type_emprunt", "SOCIETE")
    .eq("societe_id", societeId)
    .in("statut", [
      "VALIDE",
      "EN_COURS",
      "EN_ATTENTE_CONFIRMATION_RETOUR",
    ])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (empruntError) {
    console.log("Erreur scan emprunt:", empruntError);

    const error = new Error("Erreur lors de la recherche de l'emprunt");
    error.status = 500;
    throw error;
  }

  let client = null;

  if (emprunt?.client_id) {
    const { data: clientData } = await supabase
      .from("users")
      .select("id, nom, prenom, email")
      .eq("id", emprunt.client_id)
      .single();

    client = clientData || null;
  }

  return {
    materiel,
    emprunt: emprunt
      ? {
          ...emprunt,
          client,
          users: client,
          materiel,
          materiels: materiel,
        }
      : null,
  };
};

const confirmerSortie = async (workerId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .eq("type_emprunt", "SOCIETE")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt société introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "VALIDE") {
    const error = new Error("La sortie ne peut être confirmée que pour un emprunt validé");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_COURS",
      sortie_confirmee: true,
      date_sortie_effective: new Date().toISOString(),
      sortie_par: workerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur confirmerSortie:", error);

    const err = new Error("Erreur lors de la confirmation de sortie");
    err.status = 500;
    throw err;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "EMPRUNTE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "SORTIE_MATERIEL_CONFIRMEE",
    description: "Le travailleur a confirmé la sortie du matériel société.",
  });

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: "La sortie de votre matériel a été confirmée.",
    type: "SORTIE_MATERIEL",
  });

  return updatedEmprunt;
};

const retourNormal = async (workerId, empruntId) => {
  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .eq("type_emprunt", "SOCIETE")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt société introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour ne peut être déclaré que pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
      retour_par: workerId,
      probleme_retour: false,
      type_probleme_retour: null,
      commentaire_retour: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur retourNormal:", error);

    const err = new Error("Erreur lors de la déclaration du retour normal");
    err.status = 500;
    throw err;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "BON_ETAT",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "RETOUR_NORMAL_TRAVAILLEUR",
    description: "Le travailleur a déclaré un retour normal.",
  });

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: "Le retour de votre matériel a été déclaré comme normal.",
    type: "RETOUR_NORMAL",
  });

  return updatedEmprunt;
};

const retourProbleme = async (workerId, empruntId, dataRetour = {}) => {
  const { type_probleme_retour, commentaire_retour } = dataRetour;

  const { data: emprunt, error: empruntError } = await supabase
    .from("emprunts")
    .select("*")
    .eq("id", empruntId)
    .eq("type_emprunt", "SOCIETE")
    .single();

  if (empruntError || !emprunt) {
    const error = new Error("Emprunt société introuvable");
    error.status = 404;
    throw error;
  }

  if (emprunt.statut !== "EN_COURS") {
    const error = new Error("Le retour ne peut être déclaré que pour un emprunt en cours");
    error.status = 400;
    throw error;
  }

  const { data: updatedEmprunt, error } = await supabase
    .from("emprunts")
    .update({
      statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
      retour_par: workerId,
      probleme_retour: true,
      type_probleme_retour: type_probleme_retour || "ENDOMMAGE",
      commentaire_retour: commentaire_retour || "Matériel retourné avec problème.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", empruntId)
    .select()
    .single();

  if (error) {
    console.log("Erreur retourProbleme:", error);

    const err = new Error("Erreur lors de la déclaration du retour avec problème");
    err.status = 500;
    throw err;
  }

  await supabase
    .from("materiels")
    .update({
      statut: "INDISPONIBLE",
      etat: "ENDOMMAGE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", emprunt.materiel_id);

  await supabase.from("historique_actions").insert({
    user_id: workerId,
    materiel_id: emprunt.materiel_id,
    emprunt_id: empruntId,
    type_action: "RETOUR_PROBLEME_TRAVAILLEUR",
    description: "Le travailleur a déclaré un retour avec problème.",
  });

  await supabase.from("notifications").insert({
    user_id: emprunt.client_id,
    contenu: "Le retour de votre matériel a été déclaré avec un problème.",
    type: "RETOUR_PROBLEME",
  });

  return updatedEmprunt;
};

module.exports = {
  getWorkerEmprunts,
  getAllEmpruntsWorker: getWorkerEmprunts,
  scanMaterielByQr,
  confirmerSortie,
  retourNormal,
  retourProbleme,

  // Aliases pour éviter les erreurs si ton controller utilise d'anciens noms
  getEmpruntsWorker: getWorkerEmprunts,
  getAllWorkerEmprunts: getWorkerEmprunts,
  getAllEmpruntsWorker: getWorkerEmprunts,

  scanMateriel: scanMaterielByQr,
  scanQrCode: scanMaterielByQr,
  scanByQrToken: scanMaterielByQr,
  getMaterielByQrToken: scanMaterielByQr,

  confirmerSortieMateriel: confirmerSortie,
  confirmSortie: confirmerSortie,
  confirmHandover: confirmerSortie,

  confirmerRetourNormal: retourNormal,
  confirmReturnNormal: retourNormal,

  confirmerRetourProbleme: retourProbleme,
  confirmReturnProblem: retourProbleme,
};