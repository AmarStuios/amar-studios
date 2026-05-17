import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useI18n } from '../context/I18nContext';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    const qp = {};
    if (category) qp.category = category;
    if (sort) qp.sort = sort;
    qp.limit = 48;
    api.listProducts(qp).then((d) => setProducts(d.data)).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [category, sort]);

  function setParam(k, v) {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  }

  return (
    <main className="container page">
      <h1 className="h2" style={{ marginBottom: 8 }}>{t('cat.title')}</h1>
      <p style={{ color: 'var(--grey-500)', marginBottom: 24 }}>
        {t(products.length > 1 ? 'cat.product.many' : 'cat.product.one', { n: products.length })}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border)',
      }}>
        <select value={sort} onChange={(e) => setParam('sort', e.target.value)} style={{ width: 'auto' }}>
          <option value="newest">{t('cat.sort.newest')}</option>
          <option value="price_asc">{t('cat.sort.price_asc')}</option>
          <option value="price_desc">{t('cat.sort.price_desc')}</option>
        </select>
      </div>

      {loading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i}><div className="skel" style={{ aspectRatio: '4/5' }} /></div>))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty">{t('cat.empty')}</div>
      ) : (
        <div className="product-grid">{products.map((p) => (<ProductCard key={p.id} product={p} />))}</div>
      )}
    </main>
  );
}
