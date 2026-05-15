import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="alert error">{err}</div>;
  if (!data) return <p>Chargement…</p>;

  const { totals, recentOrders } = data;

  return (
    <>
      <h1>Tableau de bord</h1>

      <div className="stats">
        <div className="stat-card">
          <div className="label">Produits</div>
          <div className="value">{totals.products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Commandes</div>
          <div className="value">{totals.orders}</div>
        </div>
        <div className="stat-card">
          <div className="label">En attente</div>
          <div className="value">{totals.pendingOrders}</div>
        </div>
        <div className="stat-card">
          <div className="label">Ruptures</div>
          <div className="value">{totals.outOfStock}</div>
        </div>
        <div className="stat-card">
          <div className="label">Stock faible</div>
          <div className="value">{totals.lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="label">CA total</div>
          <div className="value">{totals.revenue.toFixed(0)} MAD</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '32px 0 16px' }}>Commandes récentes</h2>
      <div className="table">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Ville</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--grey-500)' }}>
                  Aucune commande
                </td>
              </tr>
            )}
            {recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>{o.customerName}</td>
                <td>{o.city}</td>
                <td>{parseFloat(o.total).toFixed(2)} MAD</td>
                <td><span className={`badge-status ${o.status}`}>{o.status}</span></td>
                <td>{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                <td><Link to={`/admin/commandes/${o.id}`}>Voir →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
