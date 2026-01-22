import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../cart/useCart';
import { openWhatsApp } from '../utils/whatsapp';
import { CartDrawer } from './CartDrawer';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/tienda', label: 'Tienda' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-neutral-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Fuego Amigo"
              className="h-10 md:h-12 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/logo.svg';
              }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent'
                    : 'text-neutral-300 hover:text-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-300 hover:text-secondary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-secondary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => openWhatsApp('Hola! Quiero hacer una consulta.')}
              className="hidden md:block px-4 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
            >
              WhatsApp
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-secondary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-neutral-700 mt-2 pt-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-accent'
                      : 'text-neutral-300 hover:text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  openWhatsApp('Hola! Quiero hacer una consulta.');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-0 py-2 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
              >
                WhatsApp
              </button>
            </nav>
          </div>
        )}
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
