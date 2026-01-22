import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CartDrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextType | undefined>(undefined);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <CartDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider');
  }
  return context;
}
