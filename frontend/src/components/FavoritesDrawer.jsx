import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../context/I18nContext';
import { api, imgUrl } from '../api/client';

export default function FavoritesDrawer({ open, onClose }) {
  const { ids, toggle } = useFavorites();
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || ids.size === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    Promise.all(Array.from(ids).map((id) => api.getProduct(id).catch(() => null)))
      .then((arr) => setProducts(arr.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [open, ids]);

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{t('drawer.fav')} ({ids.size})</h3>
          <button className="drawer-close" onClick={onClose} aria-label={t('btn.close')}>×</button>
        </div>
        <div className="drawer-body">
          {loading && <div className="drawer-empty">{t('common.loading')}</div>}
          {!loading && ids.size === 0 && (
            <div className="drawer-empty">
              <p style={{ marginBottom: 20 }}>{t('drawer.empty.fav')}</p>
              <p style={{ fontSize: 12, marginBottom: 20 }}>{t('drawer.empty.fav.hint')}</p>
              <Link to="/catalogue" className="btn" onClick={onClose}>{t('drawer.discover')}</Link>
            </div>
          )}
          {!loading && products.map((p) => {
            const main = p.images?.find((i) => i.isMain) || p.images?.[0];
            return (
              <div className="drawer-item" key={p.id}>
                <Link to={`/produit/${p.slug || p.id}`} onClick={onClose}>
                  {main ? <img src={imgUrl(main.url)} alt="" /> : <div className="skel" style={{ width: 80, height: 100 }} />}
                </Link>
                <Link to={`/produit/${p.slug || p.id}`} onClick={onClose} style={{ color: 'inherit' }}>
                  <div className="name">{p.name}</div>
                  <div className="meta">{p.category?.name || 'AMAR STUDIOS'}</div>
                  <div className="price">{parseFloat(p.promoPrice ?? p.price).toFixed(0)} MAD</div>
                </Link>
                <button className="remove" onClick={() => toggle(p.id)} aria-label="×">×</button>
              </div>
            );
          })}
        </div>
        {ids.size > 0 && (
          <div className="drawer-footer">
            <Link to="/catalogue" className="btn btn-outline" style={{ width: '100%' }} onClick={onClose}>
              {t('drawer.continue')}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
