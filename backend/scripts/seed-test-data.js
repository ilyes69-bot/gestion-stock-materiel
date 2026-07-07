const bcrypt = require("bcryptjs");

const supabaseModule = require("../src/config/supabase");

const supabase = supabaseModule.supabase || supabaseModule.default || supabaseModule;

const { randomUUID } = require("crypto");

const TEST_PASSWORD = "Test123456";
const SEED_MARKER = "[SEED TEST STOCKMANAGER]";

const now = () => new Date().toISOString();

const checkError = (result, action) => {
  if (result.error) {
    console.error(`Erreur pendant : ${action}`);
    console.error(result.error);
    process.exit(1);
  }

  return result.data;
};

const hashPassword = async () => {
  return bcrypt.hash(TEST_PASSWORD, 10);
};

const createOrUpdateUser = async ({
  nom,
  prenom,
  email,
  role,
  societe_id = null,
}) => {
  const password = await hashPassword();

  const existingResult = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existingResult.error) {
    console.error(existingResult.error);
    process.exit(1);
  }

  const payload = {
    nom,
    prenom,
    email,
    password,
    role,
    statut_compte: "actif",
    email_verified: true,
    societe_id,
    date_inscription: now(),
    ban_reason: null,
    banned_at: null,
  };

  if (existingResult.data) {
    const result = await supabase
      .from("users")
      .update(payload)
      .eq("id", existingResult.data.id)
      .select()
      .single();

    return checkError(result, `mise à jour utilisateur ${email}`);
  }

  const result = await supabase.from("users").insert(payload).select().single();

  return checkError(result, `création utilisateur ${email}`);
};

const createOrUpdateApprovedSociete = async ({ admin }) => {
  const existingResult = await supabase
    .from("societes")
    .select("*")
    .eq("email", "societe.demo@test.local")
    .maybeSingle();

  if (existingResult.error) {
    console.error(existingResult.error);
    process.exit(1);
  }

  const payload = {
    nom: "Société Démo StockManager",
    email: "societe.demo@test.local",
    telephone: "0600000000",
    adresse: "10 rue de test, Paris",
    description: `${SEED_MARKER} Société approuvée pour tester l'application.`,
    demandeur_id: admin.id,
    admin_id: admin.id,
    statut: "APPROUVE",
    commentaire_validation: "Société de test approuvée automatiquement.",
    updated_at: now(),
  };

  if (existingResult.data) {
    const result = await supabase
      .from("societes")
      .update(payload)
      .eq("id", existingResult.data.id)
      .select()
      .single();

    return checkError(result, "mise à jour société approuvée");
  }

  const result = await supabase
    .from("societes")
    .insert({
      ...payload,
      created_at: now(),
    })
    .select()
    .single();

  return checkError(result, "création société approuvée");
};

const createOrUpdatePendingSociete = async ({ demandeur }) => {
  const existingResult = await supabase
    .from("societes")
    .select("*")
    .eq("email", "societe.attente@test.local")
    .maybeSingle();

  if (existingResult.error) {
    console.error(existingResult.error);
    process.exit(1);
  }

  const payload = {
    nom: "Société En Attente Test",
    email: "societe.attente@test.local",
    telephone: "0611111111",
    adresse: "25 rue exemple, Paris",
    description: `${SEED_MARKER} Société en attente pour tester validation super admin.`,
    demandeur_id: demandeur.id,
    admin_id: null,
    statut: "EN_ATTENTE",
    commentaire_validation: null,
    updated_at: now(),
  };

  if (existingResult.data) {
    const result = await supabase
      .from("societes")
      .update(payload)
      .eq("id", existingResult.data.id)
      .select()
      .single();

    return checkError(result, "mise à jour société en attente");
  }

  const result = await supabase
    .from("societes")
    .insert({
      ...payload,
      created_at: now(),
    })
    .select()
    .single();

  return checkError(result, "création société en attente");
};

const cleanOldSeedData = async () => {
  console.log("Nettoyage des anciennes données de test...");

  const oldMaterielsResult = await supabase
    .from("materiels")
    .select("id")
    .ilike("description", `%${SEED_MARKER}%`);

  if (oldMaterielsResult.error) {
    console.error(oldMaterielsResult.error);
    process.exit(1);
  }

  const oldMateriels = oldMaterielsResult.data || [];
  const oldMaterielIds = oldMateriels.map((item) => item.id);

  if (oldMaterielIds.length > 0) {
    await supabase.from("emprunts").delete().in("materiel_id", oldMaterielIds);
    await supabase.from("materiels").delete().in("id", oldMaterielIds);
  }

  console.log("Nettoyage terminé.");
};

const createMateriel = async ({
  nom,
  description,
  categorie,
  statut,
  etat,
  proprietaire_type,
  societe_id = null,
  owner_user_id = null,
  statut_validation = "APPROUVE",
  prix_jour = null,
  ville = null,
}) => {
  const result = await supabase
    .from("materiels")
    .insert({
      nom,
      description: `${SEED_MARKER} ${description}`,
      categorie,
      statut,
      etat,
      quantite: 1,
      proprietaire_type,
      societe_id,
      owner_user_id,
      statut_validation,
      commentaire_validation: null,
      prix_jour,
      ville,
      qr_token: randomUUID(),
      created_at: now(),
      updated_at: now(),
    })
    .select()
    .single();

  return checkError(result, `création matériel ${nom}`);
};

const createEmprunt = async ({
  client_id,
  materiel_id,
  statut,
  type_emprunt,
  societe_id = null,
  proprietaire_user_id = null,
  sortie_confirmee = false,
  probleme_retour = false,
  type_probleme_retour = null,
  commentaire_retour = null,
  commentaire_refus_proprietaire = null,
}) => {
  const result = await supabase
    .from("emprunts")
    .insert({
      client_id,
      materiel_id,
      date_debut: "2026-07-10",
      date_fin: "2026-07-15",
      date_retour_effective:
        statut === "RETOURNE" || statut === "EN_ATTENTE_CONFIRMATION_RETOUR"
          ? now()
          : null,
      statut,
      probleme_retour,
      type_probleme_retour,
      commentaire_retour,
      sortie_confirmee,
      date_sortie_effective: sortie_confirmee ? now() : null,
      type_emprunt,
      proprietaire_user_id,
      commentaire_refus_proprietaire,
      societe_id,
      created_at: now(),
      updated_at: now(),
    })
    .select()
    .single();

  return checkError(result, `création emprunt ${statut}`);
};

const main = async () => {
  console.log("");
  console.log("====================================");
  console.log("Création données de test StockManager");
  console.log("====================================");
  console.log("");

  await cleanOldSeedData();

  console.log("Création des comptes de test...");

  let admin = await createOrUpdateUser({
    nom: "Test",
    prenom: "Admin Société",
    email: "admin.test@test.local",
    role: "admin",
  });

  const client = await createOrUpdateUser({
    nom: "Test",
    prenom: "Client",
    email: "client.test@test.local",
    role: "client",
  });

  const owner = await createOrUpdateUser({
    nom: "Test",
    prenom: "Owner",
    email: "owner.test@test.local",
    role: "client",
  });

  const client2 = await createOrUpdateUser({
    nom: "Test",
    prenom: "Client Deux",
    email: "client2.test@test.local",
    role: "client",
  });

  const demandeurSociete = await createOrUpdateUser({
    nom: "Test",
    prenom: "Demandeur Société",
    email: "demandeur.societe@test.local",
    role: "client",
  });

  console.log("Création des sociétés...");

  const societe = await createOrUpdateApprovedSociete({ admin });

  admin = await createOrUpdateUser({
    nom: "Test",
    prenom: "Admin Société",
    email: "admin.test@test.local",
    role: "admin",
    societe_id: societe.id,
  });

  const worker = await createOrUpdateUser({
    nom: "Test",
    prenom: "Travailleur",
    email: "worker.test@test.local",
    role: "travailleur",
    societe_id: societe.id,
  });

  await createOrUpdatePendingSociete({
    demandeur: demandeurSociete,
  });

  console.log("Création des matériels société...");

  const camera = await createMateriel({
    nom: "Caméra Sony A7",
    description: "Matériel société disponible.",
    categorie: "Photo",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  const micro = await createMateriel({
    nom: "Micro Rode",
    description: "Matériel société avec demande en attente.",
    categorie: "Audio",
    statut: "RESERVE",
    etat: "BON_ETAT",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  const trepied = await createMateriel({
    nom: "Trépied Manfrotto",
    description: "Matériel société validé, sortie non confirmée.",
    categorie: "Accessoire",
    statut: "RESERVE",
    etat: "BON_ETAT",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  const projecteur = await createMateriel({
    nom: "Projecteur Epson",
    description: "Matériel société en cours d'emprunt.",
    categorie: "Vidéo",
    statut: "EMPRUNTE",
    etat: "BON_ETAT",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  const lumiere = await createMateriel({
    nom: "Lumière LED Studio",
    description: "Matériel société en attente confirmation retour.",
    categorie: "Lumière",
    statut: "EMPRUNTE",
    etat: "BON_ETAT",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  const enceinte = await createMateriel({
    nom: "Enceinte JBL",
    description: "Matériel société retourné avec problème.",
    categorie: "Audio",
    statut: "EMPRUNTE",
    etat: "ENDOMMAGE",
    proprietaire_type: "SOCIETE",
    societe_id: societe.id,
  });

  console.log("Création des matériels client...");

  const perceuse = await createMateriel({
    nom: "Perceuse Bosch",
    description: "Matériel client approuvé et disponible.",
    categorie: "Bricolage",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    proprietaire_type: "UTILISATEUR",
    owner_user_id: owner.id,
    statut_validation: "APPROUVE",
    prix_jour: 12,
    ville: "Paris",
  });

  const tente = await createMateriel({
    nom: "Tente Camping 4 places",
    description: "Matériel client avec demande propriétaire en attente.",
    categorie: "Camping",
    statut: "RESERVE",
    etat: "BON_ETAT",
    proprietaire_type: "UTILISATEUR",
    owner_user_id: owner.id,
    statut_validation: "APPROUVE",
    prix_jour: 18,
    ville: "Paris",
  });

  const consoleJeu = await createMateriel({
    nom: "Console Nintendo Switch",
    description: "Matériel client en attente validation super admin.",
    categorie: "Jeux",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    proprietaire_type: "UTILISATEUR",
    owner_user_id: owner.id,
    statut_validation: "EN_ATTENTE",
    prix_jour: 10,
    ville: "Paris",
  });

  console.log("Création des emprunts société...");

  await createEmprunt({
    client_id: client.id,
    materiel_id: micro.id,
    statut: "EN_ATTENTE_VALIDATION",
    type_emprunt: "SOCIETE",
    societe_id: societe.id,
  });

  await createEmprunt({
    client_id: client.id,
    materiel_id: trepied.id,
    statut: "VALIDE",
    type_emprunt: "SOCIETE",
    societe_id: societe.id,
  });

  await createEmprunt({
    client_id: client.id,
    materiel_id: projecteur.id,
    statut: "EN_COURS",
    type_emprunt: "SOCIETE",
    societe_id: societe.id,
    sortie_confirmee: true,
  });

  await createEmprunt({
    client_id: client.id,
    materiel_id: lumiere.id,
    statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
    type_emprunt: "SOCIETE",
    societe_id: societe.id,
    sortie_confirmee: true,
  });

  await createEmprunt({
    client_id: client.id,
    materiel_id: enceinte.id,
    statut: "EN_ATTENTE_CONFIRMATION_RETOUR",
    type_emprunt: "SOCIETE",
    societe_id: societe.id,
    sortie_confirmee: true,
    probleme_retour: true,
    type_probleme_retour: "Matériel endommagé",
    commentaire_retour: "Le son grésille après le retour.",
  });

  console.log("Création des demandes client à client...");

  await createEmprunt({
    client_id: client2.id,
    materiel_id: tente.id,
    statut: "EN_ATTENTE_PROPRIETAIRE",
    type_emprunt: "UTILISATEUR",
    proprietaire_user_id: owner.id,
  });

  await createEmprunt({
    client_id: client.id,
    materiel_id: perceuse.id,
    statut: "EN_COURS",
    type_emprunt: "UTILISATEUR",
    proprietaire_user_id: owner.id,
    sortie_confirmee: true,
  });

  console.log("");
  console.log("✅ Données de test créées avec succès.");
  console.log("");
  console.log("Comptes de test :");
  console.log("-----------------------------------");
  console.log(`Admin société : admin.test@test.local / ${TEST_PASSWORD}`);
  console.log(`Travailleur : worker.test@test.local / ${TEST_PASSWORD}`);
  console.log(`Client : client.test@test.local / ${TEST_PASSWORD}`);
  console.log(`Owner client : owner.test@test.local / ${TEST_PASSWORD}`);
  console.log(`Client 2 : client2.test@test.local / ${TEST_PASSWORD}`);
  console.log(
    `Demandeur société : demandeur.societe@test.local / ${TEST_PASSWORD}`
  );
  console.log("-----------------------------------");
  console.log("");
  console.log("Pages à tester avec ton super admin existant :");
  console.log("/super-admin/dashboard");
  console.log("/super-admin/societes");
  console.log("/super-admin/materiels-en-attente");
  console.log("/super-admin/utilisateurs");
  console.log("");
  console.log("Pages à tester avec admin.test@test.local :");
  console.log("/admin/dashboard");
  console.log("/admin/materiels");
  console.log("/admin/emprunts");
  console.log("/admin/travailleurs");
  console.log("");
  console.log("Pages à tester avec worker.test@test.local :");
  console.log("/worker/dashboard");
  console.log("ou scanner un QR code depuis /admin/materiels");
  console.log("");
  console.log("Pages à tester avec owner.test@test.local :");
  console.log("/client/demandes-recues");
  console.log("");
};

main();