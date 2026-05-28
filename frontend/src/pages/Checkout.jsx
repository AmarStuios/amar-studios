import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../api/client';

export default function Checkout() {
  const { items, total: subtotal, clear } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <main className="container page">
        <div className="empty">
          <p style={{ marginBottom: 24 }}>{t('cart.empty')}</p>
          <Link to="/catalogue" className="btn">{t('cart.discover')}</Link>
        </div>
      </main>
    );
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function applyPromo() {
    setPromoError(null);
    if (!promoInput.trim()) {
      setPromoError('Entrez un code.');
      return;
    }
    setPromoChecking(true);
    try {
      const result = await api.validatePromo(promoInput.trim(), subtotal);
      setPromo(result);
    } catch (err) {
      setPromo(null);
      setPromoError(err.message);
    } finally {
      setPromoChecking(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoInput('');
    setPromoError(null);
  }

  const discount = promo ? promo.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        promoCode: promo ? promo.code : null,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      };
      const order = await api.createOrder(payload);
      clear();
      navigate(`/commande/confirmation/${order.orderNumber}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container page">
      <h1 className="h2" style={{ marginBottom: 32 }}>{t('co.title')}</h1>
      <form className="checkout" onSubmit={handleSubmit}>
        <div>
          <h3 style={{ marginBottom: 16, fontSize: 16, letterSpacing: '.05em', textTransform: 'uppercase' }}>
            {t('co.info')}
          </h3>
          {error && <div className="alert error">{error}</div>}
          <div className="field"><label>{t('co.fullname')} *</label><input name="customerName" required value={form.customerName} onChange={handleChange} /></div>
          <div className="form-row">
            <div className="field"><label>{t('co.phone')} *</label><input name="phone" required value={form.phone} onChange={handleChange} /></div>
            <div className="field"><label>{t('co.email')}</label><input name="email" type="email" value={form.email} onChange={handleChange} /></div>
          </div>
          <div className="field"><label>{t('co.address')} *</label><input name="address" required value={form.address} onChange={handleChange} /></div>
          <div className="field"><label>{t('co.city')} *</label><input name="city" required value={form.city} onChange={handleChange} /></div>
          <div className="field"><label>{t('co.notes')}</label><textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder={t('co.notes.ph')} /></div>

          {/* Code promo */}
          <div className="field" style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <label style={{ marginBottom: 8 }}>Code promo</label>
            {!promo ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Entrez votre code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="button" className="btn btn-sm btn-outline" onClick={applyPromo} disabled={promoChecking}>
                  {promoChecking ? '...' : 'Appliquer'}
                </button>
              </div>
            ) : (
              <div style={{
                background: '#f0fdf4', border: '1px solid #86efac', padding: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <strong>{promo.code}</strong> applique
                  <div style={{ fontSize: 12, color: 'var(--grey-600)' }}>
                    Remise : -{promo.discountAmount.toFixed(0)} MAD
                  </div>
                </div>
                <button type="button" className="btn btn-sm btn-outline" onClick={removePromo}>Retirer</button>
              </div>
            )}
            {promoError && <div className="alert error" style={{ marginTop: 8 }}>{promoError}</div>}
          </div>

          <p style={{ fontSize: 12, color: 'var(--grey-500)', marginTop: 16 }}>{t('co.privacy')}</p>
        </div>

        <aside className="summary">
          <h3>{t('co.your.order')}</h3>
          {items.map((it) => (
            <div className="row" key={`${it.productId}-${it.variantId}`}>
              <span>
                {it.productName} <small style={{ color: 'var(--grey-500)' }}>x{it.quantity}</small><br />
                <small style={{ color: 'var(--grey-500)' }}>{it.size} · {it.color}</small>
              </span>
              <span>{(it.unitPrice * it.quantity).toFixed(0)} MAD</span>
            </div>
          ))}
          {promo && (
            <>
              <div className="row" style={{ color: 'var(--grey-600)' }}>
                <span>Sous-total</span>
                <span>{subtotal.toFixed(0)} MAD</span>
              </div>
              <div className="row" style={{ color: '#16a34a' }}>
                <span>Code {promo.code}</span>
                <span>-{discount.toFixed(0)} MAD</span>
              </div>
            </>
          )}
          <div className="row total">
            <span>{t('cart.total')}</span>
            <span>{total.toFixed(0)} MAD</span>
          </div>
          <button type="submit" disabled={submitting} className="btn" style={{ width: '100%', marginTop: 24 }}>
            {submitting ? t('co.submitting') : t('co.submit')}
          </button>
        </aside>
      </form>
    </main>
  );
}
