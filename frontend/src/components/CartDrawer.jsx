import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { imgUrl } from '../api/client';

export default function CartDrawer({ open, onClose }) {
  const { items, total, remove } = useCart();
  const { t } = useI18n();
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>{t('drawer.cart')} ({items.length})</h3>
          <button className="drawer-close" onClick={onClose} aria-label={t('btn.close')}>×</button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <p style={{ marginBottom: 20 }}>{t('drawer.empty.cart')}</p>
              <Link to="/catalogue" className="btn" onClick={onClose}>{t('drawer.discover')}</Link>
            </div>
          ) : (
            items.map((it) => (
              <div className="drawer-item" key={`${it.productId}-${it.variantId}`}>
                {it.image ? <img src={imgUrl(it.image)} alt="" /> : <div className="skel" style={{ width: 80, height: 100 }} />}
                <div>
                  <div className="name">{it.productName}</div>
                  <div className="meta">{it.size} · {it.color} · x{it.quantity}</div>
                  <div className="price">{(it.unitPrice * it.quantity).toFixed(0)} MAD</div>
                </div>
                <button className="remove" onClick={() => remove(it.productId, it.variantId)} aria-label="×">×</button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <strong>{t('drawer.total')}</strong>
              <strong>{total.toFixed(0)} MAD</strong>
            </div>
            <Link to="/commande" className="btn" style={{ width: '100%' }} onClick={onClose}>
              {t('drawer.checkout')} →
            </Link>
            <Link to="/panier" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={onClose}>
              {t('drawer.viewcart')}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
