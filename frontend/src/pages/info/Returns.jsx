import { useI18n } from '../../context/I18nContext';
export default function Returns() {
  const { t } = useI18n();
  return (
    <main className="container page info">
      <h1>{t('info.returns.title')}</h1>
      <p>{t('info.returns.intro')}</p>
      <h2>{t('info.returns.conditions')}</h2>
      <ul>
        <li>{t('info.returns.cond.1')}</li>
        <li>{t('info.returns.cond.2')}</li>
        <li>{t('info.returns.cond.3')}</li>
      </ul>
      <h2>{t('info.returns.proc')}</h2>
      <ol style={{ paddingLeft: 20, color: 'var(--grey-700)', marginBottom: 16 }}>
        <li>{t('info.returns.p1')}</li>
        <li>{t('info.returns.p2')}</li>
        <li>{t('info.returns.p3')}</li>
        <li>{t('info.returns.p4')}</li>
      </ol>
      <p>{t('info.returns.note')}</p>
    </main>
  );
}
