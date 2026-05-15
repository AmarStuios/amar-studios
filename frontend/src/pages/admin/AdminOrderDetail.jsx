import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const LABELS = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARED: 'Préparée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api.adminGetOrder(id).then(setOrder).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function changeStatus(s) {
    setSaving(true);
    try {
      const u = await api.updateOrderStatus(id, s);
      setOrder(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="alert error">{error}</div>;
  if (!order) return <p>Chargement…</p>;

  return (
    <>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/admin/commandes" style={{ fontSize: 14 }}>← Commandes</Link>
        Commande {order.orderNumber}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
              Articles
            </h3>
            <div className="table" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr><th>Produit</th><th>Taille</th><th>Couleur</th><th>PU</th><th>Qté</th><th>Sous-total</th></tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.productName}</td>
                      <td>{it.size}</td>
                      <td>{it.color}</td>
                      <td>{parseFloat(it.unitPrice).toFixed(2)} MAD</td>
                      <td>{it.quantity}</td>
                      <td>{parseFloat(it.subtotal).toFixed(2)} MAD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'right', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <strong style={{ fontSize: 18 }}>Total : {parseFloat(order.total).toFixed(2)} MAD</strong>
            </div>
          </div>

          <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
              Client
            </h3>
            <p><strong>{order.customerName}</strong></p>
            <p>{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p style={{ marginTop: 8 }}>{order.address}</p>
            <p>{order.city}</p>
            {order.notes && (
              <>
                <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em', margin: '24px 0 12px' }}>
                  Notes
                </h3>
                <p style={{ color: 'var(--grey-600)' }}>{order.notes}</p>
              </>
            )}
          </div>
        </div>

        <aside>
          <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
              Statut
            </h3>
            <div style={{ marginBottom: 16 }}>
              <span className={`badge-status ${order.status}`}>{LABELS[order.status]}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={saving || s === order.status}
                  className={`btn btn-sm ${s === order.status ? '' : 'btn-outline'}`}
                  onClick={() => changeStatus(s)}
                  style={s === 'CANCELLED' ? { borderColor: '#c0392b', color: s === order.status ? 'var(--white)' : '#c0392b', background: s === order.status ? '#c0392b' : 'var(--white)' } : {}}
                >
                  {LABELS[s]}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--grey-500)', marginTop: 16 }}>
              Annuler une commande restaure automatiquement le stock.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
