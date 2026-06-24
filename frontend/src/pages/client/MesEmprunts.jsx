import { useEffect, useState } from "react";
import { getMesEmprunts } from "../../services/empruntService";
import {
  getEmpruntBadgeClass,
  getEmpruntLabel,
  isEmpruntEnRetard,
} from "../../utils/empruntStatus";

const MesEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmprunts = async () => {
    try {
      const data = await getMesEmprunts();
      setEmprunts(data);
    } catch (err) {
      setError("Erreur lors du chargement de vos emprunts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmprunts();
  }, []);

  return (
    <div className="my-loans-page">
      <div className="my-loans-header">
        <h1>Mes emprunts</h1>
        <p>Suivez vos emprunts en cours et vos retours validés.</p>
      </div>

      {loading && <p>Chargement...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && emprunts.length === 0 && (
        <p>Vous n’avez encore aucun emprunt.</p>
      )}

      <div className="my-loans-grid">
        {emprunts.map((emprunt) => (
          <div key={emprunt.id} className="my-loan-card">
            <h3>{emprunt.materiels?.nom || "Matériel supprimé"}</h3>

            <div className="my-loan-info">
              <div className="my-loan-info-box">
                <span>Date début</span>
                <strong>{emprunt.date_debut}</strong>
              </div>

              <div className="my-loan-info-box">
                <span>Date fin</span>
                <strong>{emprunt.date_fin}</strong>
              </div>

              <div className="my-loan-info-box">
                <span>Date retour</span>
                <strong>
                  {emprunt.date_retour_effective || "Pas encore retourné"}
                </strong>
              </div>

              <div className="my-loan-info-box">
                <span>Statut</span>
                <span className={getEmpruntBadgeClass(emprunt)}>
                  {getEmpruntLabel(emprunt)}
                </span>
              </div>

              <div className="my-loan-info-box">
                <span>Catégorie</span>
                <strong>{emprunt.materiels?.categorie || "Non définie"}</strong>
              </div>
            </div>
                        {isEmpruntEnRetard(emprunt) && (
              <p className="late-warning">
                Votre emprunt est en retard. Veuillez retourner ce matériel rapidement.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MesEmprunts;