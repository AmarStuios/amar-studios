import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const { t } = useI18n();
  return (
    <main className="container page" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ fontSize: 60, marginBottom: 24 }}>OK</div>
      <h1 className="h2" style={{ marginBottom: 16 }}>{t('oc.title')}</h1>
      <p style={{ color: 'var(--grey-600)', marginBottom: 24 }}>
        {t('oc.thanks')} <strong style={{ color: 'var(--black)' }}>{orderNumber}</strong> {t('oc.has.been')}
      </p>
      <p style={{ color: 'var(--grey-600)', marginBottom: 32 }}>{t('oc.info')}</p>
      <Link to="/catalogue" className="btn">{t('oc.continue')}</Link>
    </main>
  );
}
