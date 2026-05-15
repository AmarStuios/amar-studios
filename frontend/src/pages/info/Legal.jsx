import { useI18n } from '../../context/I18nContext';
export default function Legal() {
  const { t } = useI18n();
  return (
    <main className="container page info">
      <h1>{t('info.legal.title')}</h1>
      <p>AMAR Studios — Maroc</p>
      <p>Email : amaarstudios@gmail.com</p>
      <p>Tel : +212 6 75 82 32 72</p>
    </main>
  );
}
