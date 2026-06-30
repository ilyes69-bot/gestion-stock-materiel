const PANIER_KEY = "stockmanager_panier";

export const getPanier = () => {
  const panier = localStorage.getItem(PANIER_KEY);
  return panier ? JSON.parse(panier) : [];
};

export const savePanier = (panier) => {
  localStorage.setItem(PANIER_KEY, JSON.stringify(panier));
};

export const addToPanier = (materiel) => {
  const panier = getPanier();

  const exists = panier.some((item) => item.id === materiel.id);

  if (exists) {
    return {
      success: false,
      message: "Ce matériel est déjà dans le panier.",
    };
  }

  const newPanier = [
    ...panier,
    {
      id: materiel.id,
      nom: materiel.nom,
      categorie: materiel.categorie,
      statut: materiel.statut,
      etat: materiel.etat,
      image_url: materiel.image_url,
    },
  ];

  savePanier(newPanier);

  return {
    success: true,
    message: "Matériel ajouté au panier.",
  };
};

export const removeFromPanier = (materielId) => {
  const panier = getPanier();
  const newPanier = panier.filter((item) => item.id !== materielId);
  savePanier(newPanier);
  return newPanier;
};

export const clearPanier = () => {
  localStorage.removeItem(PANIER_KEY);
};