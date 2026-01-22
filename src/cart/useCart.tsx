import { createContext, useContext, useMemo, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  qty: number;
  notes?: string;
  image: string;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  updateNotes: (id: string, notes: string) => void;
  clear: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'fuegoamigo_cart';

const getItemKey = (item: CartItem) => `${item.id}:${item.variant ?? ''}`;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const key = getItemKey(item);
      const existing = prev.find((entry) => getItemKey(entry) === key);
      if (!existing) {
        return [...prev, item];
      }
      return prev.map((entry) =>
        getItemKey(entry) === key
          ? { ...entry, qty: entry.qty + item.qty }
          : entry
      );
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.qty, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.qty, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQty,
    updateNotes,
    clear,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
