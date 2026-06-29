export const isEmpruntEnRetard = (emprunt) => {
  if (!emprunt || emprunt.statut !== "EN_COURS") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateFin = new Date(emprunt.date_fin);
  dateFin.setHours(0, 0, 0, 0);

  return dateFin < today;
};

export const getEmpruntLabel = (emprunt) => {
  if (isEmpruntEnRetard(emprunt)) {
    return "EN_RETARD";
  }

  const labels = {
    EN_ATTENTE_VALIDATION: "EN ATTENTE VALIDATION",
    VALIDE: "VALIDÉ",
    EN_COURS: "EN COURS",
    EN_ATTENTE_CONFIRMATION_RETOUR: "EN ATTENTE CONFIRMATION RETOUR",
    RETOURNE: "RETOURNÉ",
    REFUSE: "REFUSÉ",
  };

  return labels[emprunt?.statut] || emprunt?.statut || "INCONNU";
};

export const getEmpruntBadgeClass = (emprunt) => {
  if (isEmpruntEnRetard(emprunt)) {
    return "badge badge-danger";
  }

  if (emprunt.statut === "EN_ATTENTE_VALIDATION") {
    return "badge badge-warning";
  }

  if (emprunt.statut === "VALIDE") {
    return "badge badge-info";
  }

  if (emprunt.statut === "EN_COURS") {
    return "badge badge-warning";
  }

  if (emprunt.statut === "EN_ATTENTE_CONFIRMATION_RETOUR") {
    return "badge badge-warning";
  }

  if (emprunt.statut === "RETOURNE") {
    return "badge badge-success";
  }

  if (emprunt.statut === "REFUSE") {
    return "badge badge-danger";
  }

  return "badge badge-muted";
};