import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, imgUrl } from '../../api/client';

const emptyVariant = () => ({ size: 'M', color: 'Noir', colorHex: '#000000', stock: 10 });

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    categoryId: '',
    featured: false,
    isNew: true,
  });
  const [variants, setVariants] = useState([emptyVariant()]);
  const [images, setImages] = useState([]);
  const [productId, setProductId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listCategories().then(setCategories);
    if (!isNew) {
      api.getProduct(id).then((p) => {
        setProductId(p.id);
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          promoPrice: p.promoPrice || '',
          categoryId: p.categoryId,
          featured: p.featured,
          isNew: p.isNew,
        });
        setVariants(
          p.variants.length
            ? p.variants.map((v) => ({
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || '#000000',
                stock: v.stock,
              }))
            : [emptyVariant()],
        );
        setImages(p.images);
      });
    }
  }, [id, isNew]);

  function updateField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function updateVariant(i, k, v) {
    setVariants((arr) => arr.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        promoPrice: form.promoPrice === '' ? null : parseFloat(form.promoPrice),
        variants: variants.map((v) => ({ ...v, stock: parseInt(v.stock, 10) || 0 })),
      };
      let saved;
      if (isNew) {
        saved = await api.createProduct(payload);
        setProductId(saved.id);
        setSuccess('Produit créé. Vous pouvez maintenant ajouter des images.');
        navigate(`/admin/produits/${saved.id}`, { replace: true });
      } else {
        saved = await api.updateProduct(id, payload);
        setSuccess('Modifications enregistrées.');
        setImages(saved.images);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length || !productId) return;
    try {
      await api.uploadImages(productId, files);
      const p = await api.getProduct(productId);
      setImages(p.images);
      setSuccess('Images uploadées.');
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  }

  async function setMain(imgId) {
    await api.setMainImage(imgId);
    const p = await api.getProduct(productId);
    setImages(p.images);
  }

  async function deleteImg(imgId) {
    if (!confirm('Supprimer cette image ?')) return;
    await api.deleteImage(imgId);
    const p = await api.getProduct(productId);
    setImages(p.images);
  }

  return (
    <>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/admin/produits" style={{ fontSize: 14 }}>← Produits</Link>
        {isNew ? 'Nouveau produit' : 'Éditer le produit'}
      </h1>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={save} style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
        <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Informations
          </h3>
          <div className="field">
            <label>Nom</label>
            <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Prix (MAD)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Prix promo (MAD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.promoPrice}
                onChange={(e) => updateField('promoPrice', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Catégorie</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => updateField('categoryId', e.target.value)}
            >
              <option value="">Sélectionner…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={form.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
            />
            Mettre en avant sur l'accueil
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <input
              type="checkbox"
              style={{ width: 'auto' }}
              checked={form.isNew}
              onChange={(e) => updateField('isNew', e.target.checked)}
            />
            Badge "Nouveau"
          </label>
        </div>

        <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Tailles, couleurs & stock
            </h3>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setVariants((v) => [...v, emptyVariant()])}
            >
              + Variante
            </button>
          </div>
          <div className="table">
            <table>
              <thead>
                <tr><th>Taille</th><th>Couleur</th><th>Code hex</th><th>Stock</th><th></th></tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i}>
                    <td><input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} /></td>
                    <td><input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} /></td>
                    <td>
                      <input
                        type="color"
                        style={{ padding: 0, height: 36, width: 50 }}
                        value={v.colorHex}
                        onChange={(e) => updateVariant(i, 'colorHex', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => setVariants((arr) => arr.filter((_, idx) => idx !== i))}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!isNew && (
          <div style={{ background: 'var(--white)', padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: 16, fontSize: 14, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Images
            </h3>
            <input type="file" multiple accept="image/*" onChange={handleUpload} />
            <div className="product-grid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
              {images.map((img) => (
                <div key={img.id}>
                  <div style={{ aspectRatio: '4/5', background: 'var(--grey-100)', overflow: 'hidden', position: 'relative' }}>
                    <img src={imgUrl(img.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {img.isMain && (
                      <span className="badge" style={{ position: 'absolute', top: 8, left: 8 }}>Principale</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {!img.isMain && (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => setMain(img.id)}>
                        Définir
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => deleteImg(img.id)}
                      style={{ color: '#c0392b', borderColor: '#c0392b' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} className="btn">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <Link to="/admin/produits" className="btn btn-outline">Annuler</Link>
        </div>
      </form>
    </>
  );
}
