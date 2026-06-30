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
  const [showPourboireModal, setShowPourboireModal] = useState(false);
  const [selectedPourboireEmprunt, setSelectedPourboireEmprunt] = useState(null);

  const BA9CHICH_URL = "https://ba9chich.com//fr/IlyesChniti";

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
    if (!emprunts || emprunts.length === 0) {
      return;
    }

    const empruntRetourne = emprunts.find((emprunt) => {
      const dejaPropose = localStorage.getItem(
        `pourboire_propose_${emprunt.id}`
      );

      return emprunt.statut === "RETOURNE" && !dejaPropose;
    });

    if (empruntRetourne) {
      setSelectedPourboireEmprunt(empruntRetourne);
      setShowPourboireModal(true);
    }
  }, [emprunts]);

  useEffect(() => {
    loadEmprunts();
  }, []);

  const handleLeavePourboire = () => {
    if (selectedPourboireEmprunt?.id) {
      localStorage.setItem(
        `pourboire_propose_${selectedPourboireEmprunt.id}`,
        "true"
      );
    }

    window.open(BA9CHICH_URL, "_blank");

    setShowPourboireModal(false);
    setSelectedPourboireEmprunt(null);
  };

  const handleClosePourboireModal = () => {
    if (selectedPourboireEmprunt?.id) {
      localStorage.setItem(
        `pourboire_propose_${selectedPourboireEmprunt.id}`,
        "true"
      );
    }

    setShowPourboireModal(false);
    setSelectedPourboireEmprunt(null);
  };

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
                {emprunt.statut === "RETOURNE" && (
                    <div className="pourboire-card-box">
                      <p>Vous souhaitez soutenir le service ?</p>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => window.open(BA9CHICH_URL, "_blank")}
                      >
                        Laisser un pourboire via Ba9chich
                      </button>
                    </div>
                  )}
              </div>
              {emprunt.probleme_retour && (
                <div className="client-return-problem-box">
                  <strong>Problème signalé au retour :</strong>
git status
                  <p>
                    <span>Type :</span>{" "}
                    {emprunt.type_probleme_retour || "Non renseigné"}
                  </p>

                  <p>
                    <span>Commentaire :</span>{" "}
                    {emprunt.commentaire_retour || "Aucun commentaire"}
                  </p>
                </div>
              )}

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
         {showPourboireModal && (
      <div className="pourboire-modal-overlay">
        <div className="pourboire-modal">
          <h2>Emprunt clôturé</h2>

          <p>
            Votre emprunt a été terminé avec succès. Si vous avez apprécié le
            service, vous pouvez laisser un pourboire volontaire via Ba9chich.
          </p>

          {selectedPourboireEmprunt && (
            <div className="pourboire-emprunt-info">
              <strong>Matériel :</strong>{" "}
              {selectedPourboireEmprunt.materiels?.nom ||
                selectedPourboireEmprunt.materiel?.nom ||
                "Matériel"}
            </div>
          )}

          <div className="pourboire-modal-actions">
            <button onClick={handleLeavePourboire}>
              Laisser un pourboire
            </button>

            <button
              className="secondary-button"
              onClick={handleClosePourboireModal}
            >
              Non merci
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
      </div>
  );
};

export default MesEmprunts;