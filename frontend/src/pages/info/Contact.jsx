import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';

export default function Contact() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <main className="container page info">
      <h1>{t('info.contact.title')}</h1>
      <p>{t('info.contact.intro')}</p>
      <p>
        <strong>{t('info.contact.email')}</strong> : amaarstudios@gmail.com<br />
        <strong>{t('info.contact.phone')}</strong> : +212 6 75 82 32 72<br />
        <strong>{t('info.contact.hours')}</strong> : {t('info.contact.hours.txt')}
      </p>
      <h2 style={{ marginTop: 32 }}>{t('info.contact.write')}</h2>
      {sent ? (
        <div className="alert success">{t('info.contact.sent')}</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field"><label>{t('info.contact.name')}</label><input required /></div>
            <div className="field"><label>{t('info.contact.email.label')}</label><input type="email" required /></div>
          </div>
          <div className="field"><label>{t('info.contact.subject')}</label><input required /></div>
          <div className="field"><label>{t('info.contact.message')}</label><textarea rows={5} required /></div>
          <button className="btn" type="submit">{t('info.contact.send')}</button>
        </form>
      )}
    </main>
  );
}
