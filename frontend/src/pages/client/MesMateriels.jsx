import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import {
  deleteClientMaterielClient,
  getMesMaterielsClient,
  updateClientMaterielClient,
} from "../../services/clientMaterielService";

const MesMateriels = () => {
  const { confirmDialog } = useDialog();

  const [materiels, setMateriels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    nom: "",
    description: "",
    categorie: "",
    prix_jour: "",
    ville: "",
    image: null,
  });

  const loadMateriels = async () => {
    try {
      setLoading(true);
      const data = await getMesMaterielsClient();
      setMateriels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement de vos matériels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const getValidationLabel = (statut) => {
    if (statut === "EN_ATTENTE") return "En attente de validation";
    if (statut === "APPROUVE") return "Approuvé";
    if (statut === "REFUSE") return "Refusé";
    return statut || "Non renseigné";
  };

  const getValidationClass = (statut) => {
    if (statut === "EN_ATTENTE") return "badge badge-warning";
    if (statut === "APPROUVE") return "badge badge-success";
    if (statut === "REFUSE") return "badge badge-danger";
    return "badge badge-muted";
  };

  const startEdit = (materiel) => {
    setEditingId(materiel.id);
    setEditForm({
      nom: materiel.nom || "",
      description:materiel.description?.replace("[SEED TEST STOCKMANAGER]", "").trim() || "",
      categorie: materiel.categorie || "",
      prix_jour: materiel.prix_jour || "",
      ville: materiel.ville || "",
      image: null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      nom: "",
      description: "",
      categorie: "",
      prix_jour: "",
      ville: "",
      image: null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setEditForm((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e, materielId) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("nom", editForm.nom);
      formData.append("description", editForm.description);
      formData.append("categorie", editForm.categorie);
      formData.append("prix_jour", editForm.prix_jour);
      formData.append("ville", editForm.ville);

      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      await updateClientMaterielClient(materielId, formData);

      toast.success(
        "Matériel modifié. Il est de nouveau en attente de validation."
      );

      cancelEdit();
      loadMateriels();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la modification du matériel."
      );
    }
  };

  const handleDelete = async (materielId) => {
    const confirmed = await confirmDialog({
      title: "Supprimer le matériel",
      message:
        "Voulez-vous vraiment supprimer ce matériel ? Cette action est définitive.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteClientMaterielClient(materielId);

      toast.success("Matériel supprimé avec succès.");
      loadMateriels();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression du matériel."
      );
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="client-owner-page">
      <div className="page-header">
        <h1>Mes matériels</h1>
        <p>
          Retrouvez ici les matériels que vous avez proposés à la location ou à
          l’emprunt.
        </p>
      </div>

      <Link to="/client/ajouter-materiel" className="owner-add-link">
        Ajouter un matériel
      </Link>

      {materiels.length === 0 ? (
        <div className="owner-empty-box">
          <h2>Aucun matériel proposé</h2>
          <p>
            Vous pouvez ajouter votre premier matériel pour qu’il soit validé
            avant affichage dans le catalogue.
          </p>
        </div>
      ) : (
        <div className="owner-material-grid">
          {materiels.map((materiel) => (
            <div key={materiel.id} className="owner-material-card">
              {materiel.image_url && (
                <img src={materiel.image_url} alt={materiel.nom} />
              )}

              {editingId === materiel.id ? (
                  <form
                    className="client-material-edit-form"
                    onSubmit={(e) => handleUpdate(e, materiel.id)}
                  >
                  <div className="client-material-edit-header">
                      <h4>Modifier le matériel</h4>
                      <p>
                        Après modification, le matériel sera renvoyé en validation.
                      </p>
                  </div>
                  <label>Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={editForm.nom}
                    onChange={handleEditChange}
                    required
                  />

                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="3"
                  />

                  <label>Catégorie</label>
                  <input
                    type="text"
                    name="categorie"
                    value={editForm.categorie}
                    onChange={handleEditChange}
                    required
                  />

                  <label>Ville</label>
                  <input
                    type="text"
                    name="ville"
                    value={editForm.ville}
                    onChange={handleEditChange}
                  />

                  <label>Prix par jour</label>
                  <input
                    type="number"
                    name="prix_jour"
                    value={editForm.prix_jour}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                  />

                  <label>Nouvelle image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleEditChange}
                  />

                  <div className="client-material-edit-actions">
                    <button type="submit" className="secondary-button">
                      Enregistrer
                    </button>

                    <button
                      type="button"
                      className="owner-cancel-button"
                      onClick={cancelEdit}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{materiel.nom}</h3>

                  <p>
                    <strong>Catégorie :</strong>{" "}
                    {materiel.categorie || "Non renseignée"}
                  </p>

                  <p>
                    <strong>Ville :</strong>{" "}
                    {materiel.ville || "Non renseignée"}
                  </p>

                  <p>
                    <strong>Prix/jour :</strong>{" "}
                    {materiel.prix_jour
                      ? `${materiel.prix_jour} €`
                      : "Non renseigné"}
                  </p>

                  <p>
                    <strong>Statut matériel :</strong> {materiel.statut}
                  </p>

                  <p>
                    <strong>Validation :</strong>{" "}
                    <span
                      className={getValidationClass(
                        materiel.statut_validation
                      )}
                    >
                      {getValidationLabel(materiel.statut_validation)}
                    </span>
                  </p>

                  {materiel.commentaire_validation && (
                    <div className="owner-validation-comment">
                      <strong>Commentaire admin :</strong>
                      <p>{materiel.commentaire_validation}</p>
                    </div>
                  )}

                  <div className="owner-card-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => startEdit(materiel)}
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      className="owner-delete-button"
                      onClick={() => handleDelete(materiel.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesMateriels;