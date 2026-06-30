import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  clearPanier,
  getPanier,
  removeFromPanier,
} from "../../utils/panier";
import { createEmprunt } from "../../services/empruntService";

const Panier = () => {
  const [panier, setPanier] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPanier(getPanier());
  }, []);

  const handleRemove = (materielId) => {
    const newPanier = removeFromPanier(materielId);
    setPanier(newPanier);
    toast.success("Matériel supprimé du panier.");
  };

  const handleClear = () => {
    clearPanier();
    setPanier([]);
    toast.success("Panier vidé.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (panier.length === 0) {
      toast.error("Votre panier est vide.");
      return;
    }

    if (!dateDebut || !dateFin) {
      toast.error("Veuillez choisir les dates d’emprunt.");
      return;
    }

    if (new Date(dateFin) < new Date(dateDebut)) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    try {
      setLoading(true);

      let successCount = 0;
      let errorCount = 0;

      for (const materiel of panier) {
        try {
          await createEmprunt({
            materiel_id: materiel.id,
            date_debut: dateDebut,
            date_fin: dateFin,
          });

          successCount += 1;
        } catch (error) {
          errorCount += 1;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} demande(s) d’emprunt créée(s).`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} demande(s) n’ont pas pu être créées.`);
      }

      clearPanier();
      setPanier([]);
      setDateDebut("");
      setDateFin("");
    } catch (error) {
      toast.error("Erreur lors de la validation du panier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-panier-page">
      <div className="page-header">
        <h1>Mon panier</h1>
        <p>
          Ajoutez plusieurs matériels au panier, choisissez les dates, puis
          envoyez toutes les demandes d’emprunt en même temps.
        </p>
      </div>

      {panier.length === 0 ? (
        <div className="panier-empty-box">
          <h2>Votre panier est vide</h2>
          <p>
            Retournez au catalogue pour ajouter des matériels à emprunter.
          </p>
        </div>
      ) : (
        <>
          <div className="panier-list">
            {panier.map((materiel) => (
              <div key={materiel.id} className="panier-card">
                {materiel.image_url && (
                  <img src={materiel.image_url} alt={materiel.nom} />
                )}

                <div>
                  <h3>{materiel.nom}</h3>
                  <p>
                    <strong>Catégorie :</strong>{" "}
                    {materiel.categorie || "Non renseignée"}
                  </p>
                  <p>
                    <strong>Statut :</strong> {materiel.statut}
                  </p>
                  <p>
                    <strong>État :</strong> {materiel.etat}
                  </p>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleRemove(materiel.id)}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="panier-form">
            <h2>Dates d’emprunt</h2>

            <div className="panier-form-grid">
              <div>
                <label>Date début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                />
              </div>

              <div>
                <label>Date fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                />
              </div>
            </div>

            <div className="panier-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Validation..." : "Valider le panier"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={handleClear}
                disabled={loading}
              >
                Vider le panier
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Panier;