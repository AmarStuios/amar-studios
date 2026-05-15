import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import { api } from '../api/client';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', city: '', notes: '' });
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

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
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
          <h3 style={{ marginBottom: 16, fontSize: 16, letterSpacing: '.05em', textTransform: 'uppercase' }}>{t('co.info')}</h3>
          {error && <div className="alert error">{error}</div>}
          <div className="field"><label>{t('co.fullname')} *</label><input name="customerName" required value={form.customerName} onChange={handleChange} /></div>
          <div className="form-row">
            <div className="field"><label>{t('co.phone')} *</label><input name="phone" required value={form.phone} onChange={handleChange} /></div>
            <div className="field"><label>{t('co.email')}</label><input name="email" type="email" value={form.email} onChange={handleChange} /></div>
          </div>
          <div className="field"><label>{t('co.address')} *</label><input name="address" required value={form.address} onChange={handleChange} /></div>
          <div className="field"><label>{t('co.city')} *</label><input name="city" required value={form.city} onChange={handleChange} /></div>
          <div className="field"><label>{t('co.notes')}</label><textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder={t('co.notes.ph')} /></div>
          <p style={{ fontSize: 12, color: 'var(--grey-500)' }}>{t('co.privacy')}</p>
        </div>
        <aside className="summary">
          <h3>{t('co.your.order')}</h3>
          {items.map((it) => (
            <div className="row" key={`${it.productId}-${it.variantId}`}>
              <span>{it.productName} <small style={{ color: 'var(--grey-500)' }}>x{it.quantity}</small><br />
                <small style={{ color: 'var(--grey-500)' }}>{it.size} · {it.color}</small>
              </span>
              <span>{(it.unitPrice * it.quantity).toFixed(0)} MAD</span>
            </div>
          ))}
          <div className="row total"><span>{t('cart.total')}</span><span>{total.toFixed(0)} MAD</span></div>
          <button type="submit" disabled={submitting} className="btn" style={{ width: '100%', marginTop: 24 }}>
            {submitting ? t('co.submitting') : t('co.submit')}
          </button>
        </aside>
      </form>
    </main>
  );
}
