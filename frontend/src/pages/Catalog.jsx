import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useI18n } from '../context/I18nContext';
import ProductCard from '../components/ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];

export default function Catalog() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const size = params.get('size') || '';
  const color = params.get('color') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    const qp = {};
    if (q) qp.q = q;
    if (category) qp.category = category;
    if (size) qp.size = size;
    if (color) qp.color = color;
    if (sort) qp.sort = sort;
    qp.limit = 48;
    api.listProducts(qp).then((d) => setProducts(d.data)).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [q, category, size, color, sort]);

  function setParam(k, v) {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  }

  const availableColors = useMemo(() => {
    const map = {};
    products.forEach((p) => p.variants?.forEach((v) => { if (!map[v.color]) map[v.color] = v.colorHex || '#999'; }));
    return Object.entries(map);
  }, [products]);

  return (
    <main className="container page">
      <h1 className="h2" style={{ marginBottom: 8 }}>{t('cat.title')}</h1>
      <p style={{ color: 'var(--grey-500)', marginBottom: 32 }}>
        {t(products.length > 1 ? 'cat.product.many' : 'cat.product.one', { n: products.length })}
      </p>
      <div className="catalog">
        <aside className="filters">
          <div className="filter-group">
            <h4>{t('cat.filter.search')}</h4>
            <input type="search" placeholder={t('cat.filter.search.placeholder')} value={q} onChange={(e) => setParam('q', e.target.value)} />
          </div>
          <div className="filter-group">
            <h4>{t('cat.filter.size')}</h4>
            <div className="size-chips" style={{ flexWrap: 'wrap' }}>
              {SIZES.map((s) => (
                <button key={s} className={`size-chip ${size === s ? 'active' : ''}`} onClick={() => setParam('size', size === s ? '' : s)}>{s}</button>
              ))}
            </div>
          </div>
          {availableColors.length > 0 && (
            <div className="filter-group">
              <h4>{t('cat.filter.color')}</h4>
              <div className="swatches">
                {availableColors.map(([name, hex]) => (
                  <button key={name} className={`swatch ${color === name ? 'active' : ''}`} style={{ background: hex }} title={name} onClick={() => setParam('color', color === name ? '' : name)} />
                ))}
              </div>
            </div>
          )}
        </aside>
        <div>
          <div className="catalog-head">
            <span className="count">{t('cat.results', { n: products.length })}</span>
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
        </div>
      </div>
    </main>
  );
}
