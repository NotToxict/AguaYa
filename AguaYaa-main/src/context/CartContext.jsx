import React, { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'aguaya_cart_v2'; // Cambiamos versión para limpiar caché viejo

// El estado inicial ahora guarda items Y la información de la tienda
const initialState = {
  items: [], 
  store: null, // { id, name, deliveryFee }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, store } = action.payload;
      
      // 1. Validación de Tienda Cruzada
      if (state.store && state.store.id !== store.local_id) {
        // Si ya hay items de otra tienda, no hacemos nada (o podríamos lanzar error)
        // La UI debería manejar la confirmación de "Vaciar carrito" antes de llamar a esto
        return state; 
      }

      // 2. Agregar o Actualizar Item
      const existing = state.items.find((it) => it.id === product.product_id);
      let newItems;
      
      if (existing) {
        newItems = state.items.map((it) =>
          it.id === product.product_id ? { ...it, qty: Math.min(it.qty + 1, 99) } : it
        );
      } else {
        newItems = [...state.items, { 
          id: product.product_id,
          name: product.name,
          price: parseFloat(product.price), // Asegurar número
          size: product.size,
          imageUrl: product.image_url,
          qty: 1 
        }];
      }

      return { 
        ...state, 
        items: newItems,
        // Si es el primer item, guardamos la info de la tienda
        store: state.store || { 
          id: store.local_id, 
          name: store.name, 
          deliveryFee: parseFloat(store.delivery_fee) 
        }
      };
    }
    
    case 'REMOVE': {
      const id = action.payload;
      const newItems = state.items.filter((it) => it.id !== id);
      // Si borramos el último item, liberamos la tienda
      return { 
        ...state, 
        items: newItems,
        store: newItems.length === 0 ? null : state.store
      };
    }

    case 'SET_QTY': {
      const { id, qty } = action.payload;
      if (qty <= 0) {
        // Si baja a 0, lo borramos
        const newItems = state.items.filter((it) => it.id !== id);
        return { 
          ...state, 
          items: newItems,
          store: newItems.length === 0 ? null : state.store
        };
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
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    // Renombramos a addToCart para que coincida con StoreDetailsPage
    const addToCart = (product, store) => {
      // Pequeña validación antes de despachar
      if (state.store && state.store.id !== store.local_id) {
        if (window.confirm(`Tu carrito tiene productos de "${state.store.name}". ¿Quieres vaciarlo para comprar aquí?`)) {
          dispatch({ type: 'CLEAR' });
          setTimeout(() => dispatch({ type: 'ADD', payload: { product, store } }), 0);
        }
      } else {
        dispatch({ type: 'ADD', payload: { product, store } });
      }
    };

    const removeItem = (id) => dispatch({ type: 'REMOVE', payload: id });
    
    const increment = (id) => {
      const item = state.items.find((it) => it.id === id);
      if (item) dispatch({ type: 'SET_QTY', payload: { id, qty: item.qty + 1 } });
    };
    
    const decrement = (id) => {
      const item = state.items.find((it) => it.id === id);
      if (item) dispatch({ type: 'SET_QTY', payload: { id, qty: item.qty - 1 } });
    };
    
    const clear = () => dispatch({ type: 'CLEAR' });

    // --- Cálculos Financieros ---
    const count = state.items.reduce((sum, it) => sum + it.qty, 0);
    const subtotal = state.items.reduce((sum, it) => sum + (it.price * it.qty), 0);
    const shipping = state.store ? state.store.deliveryFee : 0;
    const total = subtotal + shipping;

    return {
      items: state.items,
      store: state.store,
      addToCart,
      removeItem,
      increment,
      decrement,
      clear,
      count,
      subtotal,
      shipping, // Nuevo
      total     // Nuevo
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}