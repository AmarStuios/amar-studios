import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useI18n } from '../context/I18nContext';
import CartDrawer from './CartDrawer';
import FavoritesDrawer from './FavoritesDrawer';

function HeaderBrand() {
  return (
    <Link to="/" aria-label="AMAR Studios" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo size={50} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, color: '#fff' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '0.18em' }}>AMAR</span>
        <span style={{ fontSize: 9, letterSpacing: '0.4em', color: '#888' }}>STUDIOS</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  const marqueeItems = [
    t('marquee.cod'),
    t('marquee.brand'),
    t('marquee.shipping'),
    t('marquee.collection'),
    t('marquee.new'),
  ];

  return (
    <>
      <header className="header v2">
        <div className="container header-inner">
          <HeaderBrand />

          <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
            <NavLink to="/" end>{t('nav.home')}</NavLink>
            <NavLink to="/catalogue">{t('nav.shop')}</NavLink>
            <NavLink to="/catalogue?category=soldes">{t('nav.sales')}</NavLink>
          </nav>

          <div className="icon-actions">
            <button
              className="lang-toggle"
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              title={lang === 'fr' ? 'Switch to English' : 'Passer en francais'}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              className="btn-ghost cart-badge"
              onClick={() => setFavOpen(true)}
              aria-label={t('header.fav')}
              style={{ position: 'relative' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {favCount > 0 && <span className="count">{favCount}</span>}
            </button>
            <button
              className="btn-ghost cart-badge"
              onClick={() => setCartOpen(true)}
              aria-label={t('header.cart')}
              style={{ position: 'relative' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 7h12l-1.5 12.5a2 2 0 0 1-2 1.75h-5a2 2 0 0 1-2-1.75L6 7z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="count">{count}</span>
            </button>
            <button
              className="menu-toggle btn-ghost"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div className="marquee">
        <div className="marquee-track">
          <span>
            {marqueeItems.map((m, i) => (
              <span key={'a' + i}>{m} <span className="dot">+</span></span>
            ))}
            {marqueeItems.map((m, i) => (
              <span key={'b' + i}>{m} <span className="dot">+</span></span>
            ))}
          </span>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesDrawer open={favOpen} onClose={() => setFavOpen(false)} />
    </>
  );
}
