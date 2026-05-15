import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'amar_cart_v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [] };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { item } = action;
      const idx = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId,
      );
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, item] };
    }
    case 'UPDATE_QTY': {
      const { variantId, productId, quantity } = action;
      const items = state.items
        .map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity: Math.max(1, quantity) }
            : i,
        )
        .filter((i) => i.quantity > 0);
      return { ...state, items };
    }
    case 'REMOVE': {
      const { variantId, productId } = action;
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.productId === productId && i.variantId === variantId),
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0);
    const total = state.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    return {
      items: state.items,
      count,
      total,
      addItem: (item) => dispatch({ type: 'ADD', item }),
      updateQty: (productId, variantId, quantity) =>
        dispatch({ type: 'UPDATE_QTY', productId, variantId, quantity }),
      remove: (productId, variantId) => dispatch({ type: 'REMOVE', productId, variantId }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
