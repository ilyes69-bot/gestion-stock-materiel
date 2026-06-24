const checkDates = (dateDebut, dateFin) => {
  if (!dateDebut || !dateFin) {
    throw new Error("La date de début et la date de fin sont obligatoires");
  }

  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    throw new Error("Format de date invalide");
  }

  if (debut < today) {
    throw new Error("La date de début ne peut pas être dans le passé");
  }

  if (fin < debut) {
    throw new Error("La date de fin doit être après la date de début");
  }

  return true;
};

module.exports = checkDates;