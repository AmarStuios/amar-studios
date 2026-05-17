import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useI18n } from '../context/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer v2">
      <div className="container">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Logo size={56} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, color: '#fff' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '0.15em' }}>AMAR</span>
              <span style={{ fontSize: 9, letterSpacing: '0.4em', color: '#888' }}>STUDIOS</span>
            </span>
          </div>
          <p style={{ color: '#888', fontSize: 13, maxWidth: 320, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t('foot.tagline')}
          </p>
          <a href="https://instagram.com/amarstudios" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 16, color: '#fff', fontSize: 13, borderBottom: '1px solid #fff', paddingBottom: 2 }}>
            Instagram
          </a>
        </div>
        <div>
          <h4>{t('foot.shop')}</h4>
          <ul>
            <li><Link to="/catalogue">{t('foot.clothes')}</Link></li>
            <li><Link to="/catalogue?category=soldes">{t('foot.sales')}</Link></li>
            <li><Link to="/panier">{t('foot.mycart')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('foot.help')}</h4>
          <ul>
            <li><Link to="/livraison">{t('foot.shipping')}</Link></li>
            <li><Link to="/retours">{t('foot.returns')}</Link></li>
            <li><Link to="/guide-tailles">{t('foot.sizeguide')}</Link></li>
            <li><Link to="/faq">{t('foot.faq')}</Link></li>
            <li><Link to="/contact">{t('foot.contactlink')}</Link></li>
          </ul>
        </div>
        <div>
          <h4>{t('foot.contact')}</h4>
          <ul>
            <li>{t('foot.morocco')}</li>
            <li>+212 6 75 82 32 72</li>
            <li>amarstudios@outlook.fr</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom container">
        © {new Date().getFullYear()} AMAR Studios. {t('foot.rights')}.
      </div>
    </footer>
  );
}
