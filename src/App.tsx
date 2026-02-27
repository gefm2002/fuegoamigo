import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './cart/useCart';
import { CartDrawerProvider, useCartDrawer } from './context/CartDrawerContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { CartDrawer } from './components/CartDrawer';
import { LandingProtection, checkAccess } from './pages/LandingProtection';
import { Home } from './pages/Home';
import { Tienda } from './pages/Tienda';
import { Producto } from './pages/Producto';
import { Eventos } from './pages/Eventos';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!checkAccess()) {
    return <Navigate to="/landing" replace />;
  }
  return <>{children}</>;
}

function MainContent() {
  const { isOpen, closeDrawer } = useCartDrawer();
  
  return (
    <>
      <div className="min-h-screen flex flex-col bg-primary">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/producto/:slug" element={<Producto />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppFloatingButton />
      </div>
      <CartDrawer isOpen={isOpen} onClose={closeDrawer} />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <CartProvider>
          <CartDrawerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/landing" element={<LandingProtection />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainContent />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to={checkAccess() ? '/' : '/landing'} replace />} />
              </Routes>
            </BrowserRouter>
          </CartDrawerProvider>
        </CartProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
