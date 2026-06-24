import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createEmprunt } from "../../services/empruntService";
import toast from "react-hot-toast";

const CreerEmprunt = () => {
  const { materielId } = useParams();
  const navigate = useNavigate();

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!dateDebut || !dateFin) {
      setError("Veuillez remplir les deux dates.");
      return;
    }

    if (dateDebut < today) {
      setError("La date de début ne peut pas être dans le passé.");
      return;
    }

    if (dateFin < dateDebut) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    try {
      setLoading(true);

      await createEmprunt({
        materiel_id: materielId,
        date_debut: dateDebut,
        date_fin: dateFin,
      });

      setSuccess("Emprunt créé avec succès.");
      toast.success("Emprunt créé avec succès.");

      setTimeout(() => {
        navigate("/client/mes-emprunts");
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'emprunt"
      );
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la création de l'emprunt."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="borrow-page">
      <div className="borrow-container">
        <div className="borrow-header">
          <h1>Créer un emprunt</h1>
          <p>Choisissez la période souhaitée pour emprunter ce matériel.</p>
        </div>

        <form className="borrow-card" onSubmit={handleSubmit}>
          <div className="borrow-info">
            <h3>Informations importantes</h3>
            <p>
              La date de début doit être valide et la date de fin doit être
              supérieure ou égale à la date de début.
            </p>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="borrow-form-grid">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                value={dateDebut}
                min={today}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={dateFin}
                min={dateDebut || today}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <div className="borrow-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Création..." : "Confirmer l’emprunt"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate(-1)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreerEmprunt;