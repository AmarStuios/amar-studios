import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';

const QA_FR = [
  ['Faut-il creer un compte pour commander ?', "Non. AMAR Studios fonctionne sans compte client."],
  ['Quels sont les moyens de paiement acceptes ?', 'Paiement a la livraison (cash) partout au Maroc.'],
  ['Dans quel delai serai-je livre(e) ?', '24-48h dans les grandes villes, 3-5 jours ailleurs.'],
  ['Comment retourner un article ?', 'Consultez la page Retours pour la procedure complete.'],
];
const QA_EN = [
  ['Do I need to create an account to order?', "No. AMAR Studios works without customer account."],
  ['What payment methods are accepted?', 'Cash on delivery everywhere in Morocco.'],
  ['How long does delivery take?', '24-48h in major cities, 3-5 days elsewhere.'],
  ['How to return an item?', 'Check the Returns page for the full procedure.'],
];

export default function Faq() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(0);
  const QA = lang === 'en' ? QA_EN : QA_FR;
  return (
    <main className="container page info">
      <h1>{t('info.faq.title')}</h1>
      {QA.map(([q, a], i) => (
        <div key={i} className="faq-item" onClick={() => setOpen(open === i ? -1 : i)}>
          <h3>{q}<span style={{ fontWeight: 300 }}>{open === i ? '-' : '+'}</span></h3>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </main>
  );
}
