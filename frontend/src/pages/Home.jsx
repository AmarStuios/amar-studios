import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import { useI18n } from '../context/I18nContext';

export default function Home() {
  const { t } = useI18n();
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listProducts({ limit: 8, sort: 'newest' })
      .then((d) => setLatest(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bighero">
        <div className="bighero-disperse" aria-hidden></div>
        <div className="container bighero-inner">
          <span className="tag">{t('hero.tag')}</span>
          <h1>
            AMAR
            <span className="outline">STUDIOS</span>
          </h1>
          <div className="tagline">{t('hero.tagline')}</div>
          <div className="actions">
            <Link to="/catalogue" className="btn">{t('hero.cta1')} →</Link>
            <Link to="/catalogue?category=soldes" className="btn btn-outline">{t('hero.cta2')} →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head left" style={{ alignItems: 'flex-start' }}>
            <div>
              <span className="eyebrow">{t('cats.eyebrow')}</span>
              <h2>{t('cats.title')}</h2>
            </div>
          </div>
          <div className="cat-grid">
            <Link to="/catalogue" className="cat-card">
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a1a, #000)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.18 }}>
                <img src="/logo.jpeg" alt="" style={{ width: '60%', maxWidth: 320, opacity: 0.5 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <div className="content">
                <div className="cat-title">{t('cats.clothes')}</div>
                <div className="cat-sub">{t('cats.clothes.sub')}</div>
                <span className="cat-link">{t('cats.explore')} →</span>
              </div>
            </Link>
            <Link to="/catalogue?category=soldes" className="cat-card">
              <div className="promo-bg">
                <span>PROMO</span><span>PROMO</span><span>PROMO</span><span>PROMO</span>
              </div>
              <div className="content">
                <div className="cat-title">{t('cats.sales')}</div>
                <div className="cat-sub">{t('cats.sales.sub')}</div>
                <span className="cat-link">{t('cats.seeoffers')} →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head left">
            <div>
              <span className="eyebrow">{t('prod.trends')}</span>
              <h2>{t('prod.new')}</h2>
            </div>
            <Link to="/catalogue" className="see-all">{t('prod.seeall')} →</Link>
          </div>
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}><div className="skel" style={{ aspectRatio: '4/5' }} /></div>
              ))}
            </div>
          ) : latest.length > 0 ? (
            <div className="product-grid">
              {latest.slice(0, 4).map((p) => (<ProductCard key={p.id} product={p} />))}
            </div>
          ) : (
            <div className="empty">{t('prod.empty')}</div>
          )}
        </div>
      </section>

      <div className="sale-banner">
        <div>
          <div className="label">{t('sale.label')}</div>
          <h2>{t('sale.title1')}<br />{t('sale.title2')}</h2>
          <p>{t('sale.desc')}</p>
        </div>
        <div className="big-pct">40%</div>
        <div className="cta-wrap">
          <Link to="/catalogue?category=soldes" className="btn" style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>
            {t('sale.cta')} →
          </Link>
        </div>
      </div>
    </>
  );
}
