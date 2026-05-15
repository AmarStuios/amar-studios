import { useI18n } from '../../context/I18nContext';

export default function SizeGuide() {
  const { t } = useI18n();
  return (
    <main className="container page info">
      <h1>{t('info.size.title')}</h1>
      <p>{t('info.size.intro')}</p>
      <h2>{t('info.size.tops')}</h2>
      <div className="table" style={{ marginTop: 16, marginBottom: 32 }}>
        <table>
          <thead><tr><th>{t('prod.size')}</th><th>Poitrine / Chest (cm)</th><th>{t('cart.total')} (cm)</th></tr></thead>
          <tbody>
            <tr><td>XS</td><td>80-84</td><td>60-64</td></tr>
            <tr><td>S</td><td>84-88</td><td>64-68</td></tr>
            <tr><td>M</td><td>88-92</td><td>68-72</td></tr>
            <tr><td>L</td><td>92-96</td><td>72-76</td></tr>
            <tr><td>XL</td><td>96-100</td><td>76-80</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
