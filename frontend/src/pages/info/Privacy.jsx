import { useI18n } from '../../context/I18nContext';
export default function Privacy() {
  const { t } = useI18n();
  return (
    <main className="container page info">
      <h1>{t('info.privacy.title')}</h1>
      <p>{t('co.privacy')}</p>
    </main>
  );
}
