import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, imgUrl } from '../api/client';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const { addItem } = useCart();
  const { t } = useI18n();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getProduct(idOrSlug)
      .then((p) => { setProduct(p); setActiveImg(0); setColor(''); setSize(''); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  const colors = useMemo(() => {
    if (!product) return [];
    const m = new Map();
    product.variants.forEach((v) => { if (!m.has(v.color)) m.set(v.color, v.colorHex || '#999'); });
    return Array.from(m.entries());
  }, [product]);

  // Tailles : SEULEMENT si une couleur a ete selectionnee
  const availableSizes = useMemo(() => {
    if (!product || !color) return [];
    return product.variants
      .filter((v) => v.color === color)
      .map((v) => ({ size: v.size, stock: v.stock, id: v.id }));
  }, [product, color]);

  const selectedVariant = useMemo(() => {
    if (!product || !color || !size) return null;
    return product.variants.find((v) => v.color === color && v.size === size);
  }, [product, color, size]);

  if (loading) return <main className="container page">{t('common.loading')}</main>;
  if (!product) return <main className="container page">{t('prod.unavailable')} <Link to="/catalogue">{t('prod.back')}</Link></main>;

  const hasPromo = product.promoPrice && parseFloat(product.promoPrice) < parseFloat(product.price);
  const unitPrice = parseFloat(product.promoPrice ?? product.price);
  const images = product.images || [];

  function handleAdd() {
    setMessage(null);
    if (!color) { setMessage({ type: 'error', text: t('prod.select.color') }); return; }
    if (!size) { setMessage({ type: 'error', text: t('prod.select.size') }); return; }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      setMessage({ type: 'error', text: t('prod.stock.out') });
      return;
    }
    addItem({
      productId: product.id, productName: product.name, productSlug: product.slug,
      variantId: selectedVariant.id, size, color,
      image: product.images.find((i) => i.isMain)?.url || product.images[0]?.url || '',
      unitPrice, quantity: 1,
    });
    setMessage({ type: 'success', text: t('prod.added') });
  }

  function prevImg() {
    setActiveImg((i) => (i - 1 + images.length) % images.length);
  }
  function nextImg() {
    setActiveImg((i) => (i + 1) % images.length);
  }

  const mainImage = images[activeImg] || images[0];

  return (
    <main className="container page">
      <div className="pdp">
        <div className="pdp-gallery">
          <div className="main-img" style={{ position: 'relative' }}>
            {mainImage ? (
              <img src={imgUrl(mainImage.url)} alt={product.name} />
            ) : (
              <div className="skel" style={{ width: '100%', height: '100%' }} />
            )}
            {images.length > 1 && (
              <>
                <button className="pdp-arrow pdp-arrow-left" onClick={prevImg} aria-label="Image precedente">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <button className="pdp-arrow pdp-arrow-right" onClick={nextImg} aria-label="Image suivante">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6"/>
                  </svg>
                </button>
                <div className="pdp-counter">{activeImg + 1} / {images.length}</div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="pdp-thumbs">
              {images.map((img, i) => (
                <button key={img.id} className={`thumb ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={imgUrl(img.url)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <div className="price-row">
            {hasPromo ? (
              <><strong>{parseFloat(product.promoPrice).toFixed(0)} MAD</strong><span className="old">{parseFloat(product.price).toFixed(0)} MAD</span></>
            ) : (<strong>{parseFloat(product.price).toFixed(0)} MAD</strong>)}
          </div>
          <p className="desc">{product.description}</p>

          {colors.length > 0 && (
            <div className="option-group">
              <div className="label"><span>{t('prod.color')}</span><span>{color || '-'}</span></div>
              <div className="swatches">
                {colors.map(([name, hex]) => (
                  <button
                    key={name}
                    className={`swatch ${color === name ? 'active' : ''}`}
                    style={{ background: hex }}
                    title={name}
                    onClick={() => { setColor(name); setSize(''); }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="option-group">
            <div className="label">
              <span>{t('prod.size')}</span>
              <Link to="/guide-tailles" style={{ textDecoration: 'underline', fontSize: 12 }}>{t('prod.sizeguide')}</Link>
            </div>
            <div className="size-chips">
              {!color ? (
                <span style={{ color: 'var(--grey-500)', fontSize: 13 }}>{t('prod.select.first')}</span>
              ) : (
                availableSizes.map((v) => (
                  <button
                    key={v.id}
                    className={`size-chip ${size === v.size ? 'active' : ''} ${v.stock === 0 ? 'disabled' : ''}`}
                    onClick={() => v.stock > 0 && setSize(v.size)}
                    disabled={v.stock === 0}
                  >
                    {v.size}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedVariant && (
            <div className={`stock-msg ${selectedVariant.stock <= 3 ? 'error' : ''}`}>
              {selectedVariant.stock > 0
                ? (selectedVariant.stock <= 3 ? t('prod.stock.left', { n: selectedVariant.stock }) : t('prod.stock.in'))
                : t('prod.stock.out')}
            </div>
          )}
          {message && (<div className={`alert ${message.type}`}>{message.text}</div>)}

          <button className="btn" style={{ width: '100%', padding: '18px 28px' }} onClick={handleAdd} disabled={selectedVariant?.stock === 0}>
            {t('prod.addcart')}
          </button>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--grey-600)' }}>
            <p style={{ marginBottom: 8 }}>{t('prod.bench1')}</p>
            <p style={{ marginBottom: 8 }}>{t('prod.bench2')}</p>
            <p>{t('prod.bench3')}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
