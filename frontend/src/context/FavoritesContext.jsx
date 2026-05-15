import { createContext, useContext, useEffect, useState } from 'react';

const FavContext = createContext(null);
const KEY = 'amar_favs_v1';

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(Array.from(ids)));
  }, [ids]);

  const value = {
    ids,
    count: ids.size,
    isFav: (id) => ids.has(id),
    toggle: (id) =>
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
  };
  return <FavContext.Provider value={value}>{children}</FavContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
