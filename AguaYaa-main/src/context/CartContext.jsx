import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'aguaya_cart_v1';

const initialState = {
  items: [], // [{ id, name, price, size, imageUrl, qty }]
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const p = action.payload;
      const existing = state.items.find((it) => it.id === p.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((it) =>
            it.id === p.id ? { ...it, qty: Math.min(it.qty + 1, 99) } : it
          ),
        };
      }
      return { ...state, items: [...state.items, { ...p, qty: 1 }] };
    }
    case 'REMOVE': {
      const id = action.payload;
      return { ...state, items: state.items.filter((it) => it.id !== id) };
    }
    case 'SET_QTY': {
      const { id, qty } = action.payload;
      if (qty <= 0) {
        return { ...state, items: state.items.filter((it) => it.id !== id) };
      }
      return {
        ...state,
        items: state.items.map((it) => (it.id === id ? { ...it, qty: Math.min(qty, 99) } : it)),
      };
    }
    case 'CLEAR':
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  // Carga inicial desde localStorage
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    (init) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.items)) return parsed;
        }
      } catch {}
      return init;
    }
  );

  // Persistencia en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch {}
  }, [state.items]);

  const value = useMemo(() => {
    const addItem = (product) => dispatch({ type: 'ADD', payload: product });
    const removeItem = (id) => dispatch({ type: 'REMOVE', payload: id });
    const setQty = (id, qty) => dispatch({ type: 'SET_QTY', payload: { id, qty } });
    const increment = (id) => {
      const item = state.items.find((it) => it.id === id);
      if (item) setQty(id, item.qty + 1);
    };
    const decrement = (id) => {
      const item = state.items.find((it) => it.id === id);
      if (item) setQty(id, item.qty - 1);
    };
    const clear = () => dispatch({ type: 'CLEAR' });

    const count = state.items.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = state.items.reduce((sum, it) => sum + it.price * it.qty, 0);

    return {
      items: state.items,
      addItem,
      removeItem,
      setQty,
      increment,
      decrement,
      clear,
      count,
      subtotal,
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}