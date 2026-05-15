import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { imgUrl } from '../api/client';

export default function Cart() {
  const { items, total, updateQty, remove } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="container page">
        <h1 className="h2" style={{ marginBottom: 16 }}>{t('cart.title')}</h1>
        <div className="empty">
          <p style={{ marginBottom: 24 }}>{t('cart.empty')}</p>
          <Link to="/catalogue" className="btn">{t('cart.discover')}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container page">
      <h1 className="h2" style={{ marginBottom: 32 }}>{t('cart.title')}</h1>
      <div className="cart-grid">
        <div>
          {items.map((it) => (
            <div className="cart-item" key={`${it.productId}-${it.variantId}`}>
              <Link to={`/produit/${it.productSlug || it.productId}`}>
                {it.image ? <img src={imgUrl(it.image)} alt="" /> : <div className="skel" style={{ aspectRatio: '4/5' }} />}
              </Link>
              <div>
                <h4>{it.productName}</h4>
                <div className="meta">{t('prod.size')} : {it.size} · {t('prod.color')} : {it.color}</div>
                <div className="meta" style={{ marginTop: 4 }}>{it.unitPrice.toFixed(0)} MAD {t('cart.unit')}</div>
                <div className="qty">
                  <button onClick={() => updateQty(it.productId, it.variantId, it.quantity - 1)}>-</button>
                  <span>{it.quantity}</span>
                  <button onClick={() => updateQty(it.productId, it.variantId, it.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{(it.unitPrice * it.quantity).toFixed(0)} MAD</strong>
                <div>
                  <button className="btn-ghost" onClick={() => remove(it.productId, it.variantId)} style={{ fontSize: 12, marginTop: 8, textDecoration: 'underline' }}>
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h3>{t('cart.summary')}</h3>
          <div className="row"><span>{t('cart.subtotal')}</span><span>{total.toFixed(0)} MAD</span></div>
          <div className="row"><span>{t('cart.shipping.label')}</span><span style={{ color: 'var(--grey-500)' }}>{t('cart.shipping.calc')}</span></div>
          <div className="row total"><span>{t('cart.total')}</span><span>{total.toFixed(0)} MAD</span></div>
          <button className="btn" style={{ width: '100%', marginTop: 24 }} onClick={() => navigate('/commande')}>{t('cart.checkout')}</button>
          <Link to="/catalogue" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, textDecoration: 'underline' }}>{t('cart.continue')}</Link>
        </aside>
      </div>
    </main>
  );
}
