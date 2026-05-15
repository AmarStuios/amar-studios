import { useI18n } from '../../context/I18nContext';
export default function Shipping() {
  const { t } = useI18n();
  return (
    <main className="container page info">
      <h1>{t('info.shipping.title')}</h1>
      <p>{t('info.shipping.intro')}</p>
      <h2>{t('info.shipping.fees')}</h2>
      <ul>
        <li>{t('info.shipping.standard')}</li>
        <li>{t('info.shipping.express')}</li>
      </ul>
      <h2>{t('info.shipping.payment')}</h2>
      <p>{t('info.shipping.payment.txt')}</p>
      <h2>{t('info.shipping.tracking')}</h2>
      <p>{t('info.shipping.tracking.txt')}</p>
    </main>
  );
}
