import { useEffect, useState } from "react";
import { getMateriels } from "../../services/materielService";
import MaterielCard from "../../components/materiel/MaterielCard";

const Catalogue = () => {
  const [materiels, setMateriels] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMateriels = async () => {
    try {
      const data = await getMateriels();
      setMateriels(data);
    } catch (err) {
      setError("Erreur lors du chargement des matériels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const materielsFiltres = materiels.filter((materiel) =>
    materiel.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="catalogue-page">
      <div className="catalogue-header">
        <h1>Catalogue des matériels</h1>
        <p>Consultez les matériels disponibles et créez un emprunt en quelques clics.</p>
      </div>

      <div className="catalogue-search">
        <input
          type="text"
          placeholder="Rechercher un matériel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Chargement...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && materielsFiltres.length === 0 && (
        <p>Aucun matériel trouvé.</p>
      )}

      <div className="catalogue-grid">
        {materielsFiltres.map((materiel) => (
          <MaterielCard key={materiel.id} materiel={materiel} />
        ))}
      </div>
    </div>
  );
};

export default Catalogue;