import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './cart/useCart';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { LandingProtection, checkAccess } from './pages/LandingProtection';
import { Home } from './pages/Home';
import { Tienda } from './pages/Tienda';
import { Producto } from './pages/Producto';
import { Eventos } from './pages/Eventos';
import { Admin } from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!checkAccess()) {
    return <Navigate to="/landing" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<LandingProtection />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col bg-primary">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/tienda" element={<Tienda />} />
                      <Route path="/producto/:slug" element={<Producto />} />
                      <Route path="/eventos" element={<Eventos />} />
                      <Route path="/admin" element={<Admin />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppFloatingButton />
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={checkAccess() ? '/' : '/landing'} replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
