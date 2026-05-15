import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="container page" style={{ textAlign: 'center' }}>
      <h1 className="h1" style={{ marginBottom: 16 }}>{t('nf.title')}</h1>
      <p style={{ marginBottom: 32, color: 'var(--grey-500)' }}>{t('nf.txt')}</p>
      <Link to="/" className="btn">{t('nf.back')}</Link>
    </main>
  );
}
