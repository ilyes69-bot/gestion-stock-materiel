const supabase = require("../config/supabase");

const today = new Date();

const formatDate = (date) => date.toISOString().split("T")[0];

const addDays = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

const materiels = [
  {
    nom: "Guitare acoustique Yamaha F310",
    description: "Guitare acoustique adaptée aux répétitions et concerts.",
    categorie: "Instrument à cordes",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Guitare électrique Fender Stratocaster",
    description: "Guitare électrique pour scène, studio et répétitions.",
    categorie: "Instrument à cordes",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Basse électrique Ibanez",
    description: "Basse électrique pour groupe musical et performance live.",
    categorie: "Instrument à cordes",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Clavier piano Yamaha",
    description: "Clavier numérique pour répétitions, cours et concerts.",
    categorie: "Clavier",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Piano numérique Casio Privia",
    description: "Piano numérique avec sons réalistes et toucher dynamique.",
    categorie: "Clavier",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Table DJ Pioneer DDJ-400",
    description: "Contrôleur DJ pour mixage, soirées et animations.",
    categorie: "DJ",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Table de mixage Behringer",
    description: "Table de mixage audio pour gérer plusieurs sources sonores.",
    categorie: "DJ",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Platine DJ Pioneer CDJ",
    description: "Platine DJ professionnelle pour lecture et mixage musical.",
    categorie: "DJ",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Casque DJ Audio-Technica",
    description: "Casque audio fermé pour mixage DJ et monitoring.",
    categorie: "Audio",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Casque studio Sony MDR",
    description: "Casque professionnel pour enregistrement et écoute studio.",
    categorie: "Audio",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Micro Shure SM58",
    description: "Microphone dynamique idéal pour voix et scène.",
    categorie: "Microphone",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Micro studio Rode NT1",
    description: "Microphone de studio pour enregistrement vocal.",
    categorie: "Microphone",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Micro sans fil Sennheiser",
    description: "Micro sans fil pour conférence, chant et animation.",
    categorie: "Microphone",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Enceinte JBL PartyBox",
    description: "Enceinte puissante pour soirées et événements musicaux.",
    categorie: "Sonorisation",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Enceinte active Yamaha DBR12",
    description: "Enceinte active professionnelle pour concerts et répétitions.",
    categorie: "Sonorisation",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Amplificateur guitare Marshall",
    description: "Ampli guitare pour répétition et performance live.",
    categorie: "Amplificateur",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Amplificateur basse Fender",
    description: "Ampli basse pour concerts et sessions de répétition.",
    categorie: "Amplificateur",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Batterie acoustique Pearl",
    description: "Batterie complète pour répétition musicale.",
    categorie: "Percussion",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Batterie électronique Roland",
    description: "Batterie électronique pour entraînement et studio.",
    categorie: "Percussion",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Cajón percussion",
    description: "Instrument de percussion acoustique pour sessions live.",
    categorie: "Percussion",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Carte son Focusrite Scarlett",
    description: "Interface audio pour enregistrement studio.",
    categorie: "Studio",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Moniteurs studio KRK",
    description: "Enceintes de monitoring pour production musicale.",
    categorie: "Studio",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Pied de micro réglable",
    description: "Support réglable pour microphone de scène ou studio.",
    categorie: "Accessoire",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Support guitare",
    description: "Support stable pour guitare acoustique ou électrique.",
    categorie: "Accessoire",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Câble audio XLR",
    description: "Câble XLR pour connecter micros et matériel audio.",
    categorie: "Accessoire",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Projecteur LED scène",
    description: "Projecteur lumineux pour ambiance de scène et événements.",
    categorie: "Lumière",
    statut: "DISPONIBLE",
    etat: "BON_ETAT",
    quantite: 1,
  },
  {
    nom: "Machine à fumée",
    description: "Machine à fumée pour événements musicaux et scènes.",
    categorie: "Lumière",
    statut: "INDISPONIBLE",
    etat: "ENDOMMAGE",
    quantite: 1,
  },
];

const empruntsDemo = [
  {
    materielNom: "Guitare acoustique Yamaha F310",
    date_debut: addDays(-2),
    date_fin: addDays(5),
    statut: "EN_COURS",
  },
  {
    materielNom: "Table DJ Pioneer DDJ-400",
    date_debut: addDays(-10),
    date_fin: addDays(-2),
    statut: "EN_COURS",
  },
  {
    materielNom: "Micro Shure SM58",
    date_debut: addDays(-15),
    date_fin: addDays(-8),
    date_retour_effective: addDays(-7),
    statut: "RETOURNE",
  },
  {
    materielNom: "Enceinte JBL PartyBox",
    date_debut: addDays(-4),
    date_fin: addDays(3),
    statut: "EN_COURS",
  },
  {
    materielNom: "Casque DJ Audio-Technica",
    date_debut: addDays(-20),
    date_fin: addDays(-12),
    date_retour_effective: addDays(-11),
    statut: "RETOURNE",
  },
];

const seed = async () => {
  try {
    console.log("Début du remplissage de la base avec du matériel musical...");

    for (const materiel of materiels) {
      const { data: existing } = await supabase
        .from("materiels")
        .select("id")
        .eq("nom", materiel.nom)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("materiels").insert(materiel);

        if (error) {
          console.log("Erreur matériel :", materiel.nom, error.message);
        }
      }
    }

    console.log("Matériels musicaux ajoutés.");

    const { data: clients, error: clientsError } = await supabase
      .from("users")
      .select("id, email")
      .eq("role", "client")
      .limit(5);

    if (clientsError) {
      console.log("Erreur chargement clients :", clientsError.message);
    }

    if (!clients || clients.length === 0) {
      console.log("Aucun client trouvé. Les matériels ont été ajoutés sans emprunts.");
      process.exit(0);
    }

    const { data: allMateriels } = await supabase
      .from("materiels")
      .select("id, nom");

    const materielByNom = {};

    allMateriels.forEach((materiel) => {
      materielByNom[materiel.nom] = materiel.id;
    });

    for (let i = 0; i < empruntsDemo.length; i++) {
      const emprunt = empruntsDemo[i];
      const client = clients[i % clients.length];
      const materielId = materielByNom[emprunt.materielNom];

      if (!client || !materielId) continue;

      const { data: existingEmprunt } = await supabase
        .from("emprunts")
        .select("id")
        .eq("client_id", client.id)
        .eq("materiel_id", materielId)
        .eq("date_debut", emprunt.date_debut)
        .maybeSingle();

      if (existingEmprunt) {
        continue;
      }

      const { data: createdEmprunt, error } = await supabase
        .from("emprunts")
        .insert({
          client_id: client.id,
          materiel_id: materielId,
          date_debut: emprunt.date_debut,
          date_fin: emprunt.date_fin,
          date_retour_effective: emprunt.date_retour_effective || null,
          statut: emprunt.statut,
        })
        .select()
        .single();

      if (error) {
        console.log("Erreur emprunt :", error.message);
        continue;
      }

      if (emprunt.statut === "EN_COURS") {
        await supabase
          .from("materiels")
          .update({
            statut: "EMPRUNTE",
            etat: "BON_ETAT",
          })
          .eq("id", materielId);
      }

      await supabase.from("notifications").insert({
        user_id: client.id,
        contenu: `Votre emprunt du matériel ${emprunt.materielNom} a été enregistré.`,
        type: "EMPRUNT",
        lu: false,
      });

      await supabase.from("historique_actions").insert({
        user_id: client.id,
        materiel_id: materielId,
        emprunt_id: createdEmprunt.id,
        type_action: "CREATION_EMPRUNT",
        description: `Emprunt créé pour le matériel ${emprunt.materielNom}.`,
      });
    }

    console.log("Emprunts, notifications et historiques ajoutés.");
    console.log("Base remplie avec succès avec du matériel musical !");
    process.exit(0);
  } catch (error) {
    console.error("Erreur seed :", error.message);
    process.exit(1);
  }
};

seed();