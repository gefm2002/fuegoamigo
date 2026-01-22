import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../cart/useCart';
import { useCartDrawer } from '../context/CartDrawerContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openDrawer } = useCartDrawer();
  const { itemCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/#servicios', label: 'Servicios' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/tienda', label: 'Tienda' },
    { path: '/#faqs', label: 'FAQs' },
    { path: '/#contacto', label: 'Contacto' },
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
            {navLinks.map((link) => {
              const isActive = link.path.includes('#') 
                ? location.pathname === '/' && location.hash === link.path.split('#')[1]
                : location.pathname === link.path;
              
              const handleClick = (e: React.MouseEvent) => {
                if (link.path.includes('#')) {
                  e.preventDefault();
                  const hash = link.path.split('#')[1];
                  if (location.pathname !== '/') {
                    window.location.href = `/#${hash}`;
                  } else {
                    const element = document.getElementById(hash);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }
              };

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleClick}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-neutral-300 hover:text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
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
                <span className="absolute -top-1 -right-1 bg-accent text-secondary text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
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
              {navLinks.map((link) => {
                const handleClick = (e: React.MouseEvent) => {
                  setIsMenuOpen(false);
                  if (link.path.includes('#')) {
                    e.preventDefault();
                    const hash = link.path.split('#')[1];
                    if (location.pathname !== '/') {
                      window.location.href = `/#${hash}`;
                    } else {
                      const element = document.getElementById(hash);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }
                };

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleClick}
                    className={`text-base font-medium transition-colors ${
                      location.pathname === link.path || (link.path.includes('#') && location.pathname === '/')
                        ? 'text-accent'
                        : 'text-neutral-300 hover:text-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
