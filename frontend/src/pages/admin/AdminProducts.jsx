import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from '../../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await api.adminListProducts(q ? { q } : {});
      setProducts(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function toggle(p) {
    try {
      await api.toggleProduct(p.id, !p.active);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(p) {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    setError(null); setInfo(null);
    try {
      const r = await api.deleteProduct(p.id);
      if (r.archived) {
        setInfo(r.message || 'Produit archive (des commandes existaient).');
      } else {
        setInfo('Produit supprime.');
      }
      load();
    } catch (e) {
      setError('Erreur suppression : ' + e.message);
    }
  }

  return (
    <>
      <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Produits
        <Link to="/admin/produits/nouveau" className="btn">+ Nouveau produit</Link>
      </h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, maxWidth: 400 }}>
        <input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <button className="btn btn-sm btn-outline" onClick={load}>Filtrer</button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {info && <div className="alert success">{info}</div>}

      <div className="table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan="7">Chargement...</td></tr>)}
            {!loading && products.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--grey-500)' }}>Aucun produit</td></tr>
            )}
            {products.map((p) => {
              const totalStock = (p.variants || []).reduce((s, v) => s + v.stock, 0);
              const main = p.images?.find((i) => i.isMain) || p.images?.[0];
              return (
                <tr key={p.id}>
                  <td style={{ width: 60 }}>
                    {main ? (
                      <img src={imgUrl(main.url)} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                    ) : (
                      <div className="skel" style={{ width: 48, height: 48 }} />
                    )}
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ color: 'var(--grey-500)', fontSize: 12 }}>{p.slug}</div>
                  </td>
                  <td>{p.category?.name}</td>
                  <td>
                    {p.promoPrice ? (
                      <>
                        <strong>{parseFloat(p.promoPrice).toFixed(0)} MAD</strong>{' '}
                        <small style={{ textDecoration: 'line-through', color: 'var(--grey-400)' }}>
                          {parseFloat(p.price).toFixed(0)} MAD
                        </small>
                      </>
                    ) : (
                      `${parseFloat(p.price).toFixed(0)} MAD`
                    )}
                  </td>
                  <td style={{ color: totalStock === 0 ? '#c0392b' : 'inherit' }}>{totalStock}</td>
                  <td>
                    <span className={`badge-status ${p.active ? 'DELIVERED' : 'CANCELLED'}`}>
                      {p.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/produits/${p.id}`} className="btn btn-sm btn-outline">Éditer</Link>{' '}
                    <button className="btn btn-sm btn-outline" onClick={() => toggle(p)}>
                      {p.active ? 'Désactiver' : 'Activer'}
                    </button>{' '}
                    <button className="btn btn-sm btn-outline" onClick={() => remove(p)} style={{ color: '#c0392b', borderColor: '#c0392b' }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
