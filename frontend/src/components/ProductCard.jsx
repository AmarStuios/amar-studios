import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { imgUrl } from '../api/client';
import { useFavorites } from '../context/FavoritesContext';

export default function ProductCard({ product }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(product.id);
  const mainImg = product.images?.find((i) => i.isMain) || product.images?.[0];
  const hasPromo = product.promoPrice && parseFloat(product.promoPrice) < parseFloat(product.price);

  const sizes = useMemo(() => {
    const set = new Set();
    (product.variants || []).forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [product]);

  const colors = useMemo(() => {
    const m = new Map();
    (product.variants || []).forEach((v) => {
      if (!m.has(v.color)) m.set(v.color, v.colorHex || '#999');
    });
    return Array.from(m.entries());
  }, [product]);

  function handleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  }

  return (
    <Link to={`/produit/${product.slug || product.id}`} className="pcard">
      <div className="img-wrap">
        {product.isNew && <span className="badge-new">NOUVEAU</span>}
        <button
          type="button"
          className={`fav ${fav ? 'active' : ''}`}
          onClick={handleFav}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? '#e91e63' : 'none'} stroke={fav ? '#e91e63' : '#000'} strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {mainImg ? (
          <img src={imgUrl(mainImg.url)} alt={product.name} loading="lazy" />
        ) : (
          <div className="skel" style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="brand">AMAR STUDIOS</div>
      <div className="pname">{product.name}</div>
      <div className="pprice">
        {hasPromo ? (
          <>
            {parseFloat(product.promoPrice).toFixed(0)} MAD
            <span className="old">{parseFloat(product.price).toFixed(0)} MAD</span>
          </>
        ) : (
          <>{parseFloat(product.price).toFixed(0)} MAD</>
        )}
      </div>
      {colors.length > 0 && (
        <div className="colors" style={{ marginBottom: 6 }}>
          {colors.slice(0, 5).map(([name, hex]) => (
            <span key={name} className="dot" style={{ background: hex }} title={name} />
          ))}
        </div>
      )}
      {sizes.length > 0 && (
        <div className="sizes">
          {sizes.slice(0, 5).map((s, i) => (
            <span key={s} className={`sz ${i === 0 ? 'active' : ''}`}>{s}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
