import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PREPARED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    const params = {};
    if (q) params.q = q;
    if (status) params.status = status;
    const d = await api.adminListOrders(params);
    setOrders(d.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [status]);

  return (
    <>
      <h1>Commandes</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, maxWidth: 700 }}>
        <input
          placeholder="Nom, téléphone, ville, n° commande…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto' }}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'Tous les statuts'}</option>
          ))}
        </select>
        <button className="btn btn-sm btn-outline" onClick={load}>Filtrer</button>
      </div>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan="8">Chargement…</td></tr>)}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--grey-500)' }}>Aucune commande</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.orderNumber}</strong></td>
                <td>{o.customerName}</td>
                <td>{o.phone}</td>
                <td>{o.city}</td>
                <td>{parseFloat(o.total).toFixed(2)} MAD</td>
                <td><span className={`badge-status ${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleString('fr-FR')}</td>
                <td><Link to={`/admin/commandes/${o.id}`}>Détail →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
