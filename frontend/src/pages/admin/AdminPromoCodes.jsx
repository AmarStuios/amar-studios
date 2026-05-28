import { useEffect, useState } from 'react';
import { api } from '../../api/client';

const empty = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: '',
  active: true,
  usageLimit: '',
  minOrderAmount: '',
  validUntil: '',
};

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api.listPromoCodes();
      setCodes(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function startEdit(c) {
    setEditing(c.id);
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      active: c.active,
      usageLimit: c.usageLimit || '',
      minOrderAmount: c.minOrderAmount || '',
      validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
    });
    setError(null);
    setInfo(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(empty);
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    try {
      const payload = { ...form };
      if (editing) {
        await api.updatePromoCode(editing, payload);
        setInfo('Code mis a jour.');
      } else {
        await api.createPromoCode(payload);
        setInfo('Code cree.');
      }
      setForm(empty);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(c) {
    if (!confirm('Supprimer le code "' + c.code + '" ?')) return;
    try {
      await api.deletePromoCode(c.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleActive(c) {
    try {
      await api.updatePromoCode(c.id, { active: !c.active });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Codes promo</h1>
      {error && <div className="alert error">{error}</div>}
      {info && <div className="alert success">{info}</div>}

      <form onSubmit={save} style={{ background: '#fff', padding: 24, border: '1px solid var(--border)', marginBottom: 24, maxWidth: 800 }}>
        <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
          {editing ? 'Modifier le code' : 'Nouveau code promo'}
        </h3>
        <div className="form-row">
          <div className="field">
            <label>Code (ex: WELCOME10)</label>
            <input required value={form.code} onChange={(e) => setField('code', e.target.value.toUpperCase())} placeholder="WELCOME10" />
          </div>
          <div className="field">
            <label>Description (optionnel)</label>
            <input value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Bienvenue nouveau client" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Type de remise</label>
            <select value={form.discountType} onChange={(e) => setField('discountType', e.target.value)}>
              <option value="PERCENT">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (MAD)</option>
            </select>
          </div>
          <div className="field">
            <label>Valeur ({form.discountType === 'PERCENT' ? '%' : 'MAD'})</label>
            <input required type="number" step="0.01" min="0" value={form.discountValue} onChange={(e) => setField('discountValue', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Limite d'utilisation (optionnel)</label>
            <input type="number" min="1" value={form.usageLimit} onChange={(e) => setField('usageLimit', e.target.value)} placeholder="ex: 100" />
          </div>
          <div className="field">
            <label>Commande minimum (MAD, optionnel)</label>
            <input type="number" step="0.01" min="0" value={form.minOrderAmount} onChange={(e) => setField('minOrderAmount', e.target.value)} placeholder="ex: 500" />
          </div>
        </div>
        <div className="field">
          <label>Valide jusqu'au (optionnel)</label>
          <input type="date" value={form.validUntil} onChange={(e) => setField('validUntil', e.target.value)} />
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <input type="checkbox" style={{ width: 'auto' }} checked={form.active} onChange={(e) => setField('active', e.target.checked)} />
          Code actif
        </label>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" type="submit">{editing ? 'Enregistrer' : '+ Creer le code'}</button>
          {editing && <button type="button" className="btn btn-outline" onClick={cancelEdit}>Annuler</button>}
        </div>
      </form>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Remise</th>
              <th>Min</th>
              <th>Utilisation</th>
              <th>Expire</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan="7">Chargement...</td></tr>)}
            {!loading && codes.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--grey-500)' }}>Aucun code promo</td></tr>
            )}
            {codes.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.code}</strong>
                  {c.description && <div style={{ fontSize: 11, color: 'var(--grey-500)' }}>{c.description}</div>}
                </td>
                <td>
                  {c.discountType === 'PERCENT'
                    ? parseFloat(c.discountValue).toFixed(0) + '%'
                    : parseFloat(c.discountValue).toFixed(0) + ' MAD'}
                </td>
                <td>{c.minOrderAmount ? parseFloat(c.minOrderAmount).toFixed(0) + ' MAD' : '-'}</td>
                <td>{c.usedCount}{c.usageLimit ? ' / ' + c.usageLimit : ''}</td>
                <td>{c.validUntil ? new Date(c.validUntil).toLocaleDateString('fr-FR') : '-'}</td>
                <td>
                  <span className={`badge-status ${c.active ? 'DELIVERED' : 'CANCELLED'}`}>
                    {c.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => startEdit(c)}>Editer</button>{' '}
                  <button className="btn btn-sm btn-outline" onClick={() => toggleActive(c)}>{c.active ? 'Desactiver' : 'Activer'}</button>{' '}
                  <button className="btn btn-sm btn-outline" onClick={() => remove(c)} style={{ color: '#c0392b', borderColor: '#c0392b' }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
