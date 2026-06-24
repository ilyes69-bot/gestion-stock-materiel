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

  return emprunt.statut;
};

export const getEmpruntBadgeClass = (emprunt) => {
  if (isEmpruntEnRetard(emprunt)) {
    return "badge badge-danger";
  }

  if (emprunt.statut === "EN_COURS") {
    return "badge badge-warning";
  }

  if (emprunt.statut === "RETOURNE") {
    return "badge badge-success";
  }

  return "badge badge-muted";
};