import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteMateriel, getMateriels } from "../../services/materielService";
import { QRCodeCanvas } from "qrcode.react";

const ListeMateriels = () => {
  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMateriels = async () => {
    try {
      const data = await getMateriels();
      setMateriels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erreur lors du chargement des matériels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce matériel ?"
    );

    if (!confirmation) return;

    try {
      setError("");
      setSuccess("");

      await deleteMateriel(id);

      setSuccess("Matériel supprimé avec succès");
      loadMateriels();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const getStatutClass = (statut) => {
    if (statut === "DISPONIBLE") return "badge badge-success";
    if (statut === "EMPRUNTE") return "badge badge-warning";
    return "badge badge-danger";
  };

  const getEtatClass = (etat) => {
    if (etat === "BON_ETAT") return "badge badge-success";
    return "badge badge-danger";
  };
  const getQrScanUrl = (qrToken) => {
  return `${window.location.origin}/worker/scan/${qrToken}`;
  };

  const copyQrLink = async (qrToken) => {
    const link = getQrScanUrl(qrToken);

    try {
      await navigator.clipboard.writeText(link);
      alert("Lien du QR code copié avec succès.");
    } catch (error) {
      alert("Erreur lors de la copie du lien.");
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1>Gestion du matériel</h1>
          <p>Ajoutez, modifiez ou supprimez les matériels de votre stock.</p>
        </div>

        <Link className="button-link" to="/admin/materiels/ajouter">
          + Ajouter un matériel
        </Link>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {!loading && materiels.length === 0 && (
        <p>Aucun matériel trouvé.</p>
      )}

      <div className="inventory-grid">
        {materiels.map((materiel) => (
          <div key={materiel.id} className="inventory-card">
            {materiel.image_url ? (
                <img
                  className="materiel-image"
                  src={materiel.image_url}
                  alt={materiel.nom}
                />
              ) : (
                <div className="materiel-image-placeholder">
                  Aucune photo
                </div>
              )}
            <div className="inventory-card-header">
              <h3>{materiel.nom}</h3>

              <span className="inventory-category">
                {materiel.categorie || "Non définie"}
              </span>
            </div>

            <p className="inventory-description">
              {materiel.description || "Aucune description disponible."}
            </p>

            <div className="inventory-info">

              <div className="inventory-info-box">
                <span>Statut</span>
                <span className={getStatutClass(materiel.statut)}>
                  {materiel.statut}
                </span>
              </div>

              <div className="inventory-info-box">
                <span>État</span>
                <span className={getEtatClass(materiel.etat)}>
                  {materiel.etat}
                </span>
              </div>
            </div>
              {materiel.qr_token && (
                <div className="admin-materiel-qr-box">
                  <p className="admin-materiel-qr-title">QR code du matériel</p>

                  <div className="admin-materiel-qr-image">
                    <QRCodeCanvas
                      value={getQrScanUrl(materiel.qr_token)}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => copyQrLink(materiel.qr_token)}
                  >
                    Copier lien scan
                  </button>
                </div>
              )}
              
            <div className="inventory-actions">
              <Link
                className="button-link"
                to={`/admin/materiels/modifier/${materiel.id}`}
              >
                Modifier
              </Link>

              <button
                className="delete-button"
                onClick={() => handleDelete(materiel.id)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default ListeMateriels;