import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const ACCESS_CODE = 'fuego2026';
const ACCESS_STORAGE_KEY = 'fuegoamigo_access_granted';

export function LandingProtection() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Verificar si ya tiene acceso
  const hasAccess = checkAccess();

  if (hasAccess) {
    // Usar useEffect para navegar después del render
    setTimeout(() => navigate('/', { replace: true }), 0);
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      localStorage.setItem(ACCESS_STORAGE_KEY, 'true');
      navigate('/');
    } else {
      setError('Código incorrecto');
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/images/logo.png"
            alt="Fuego Amigo"
            className="h-24 md:h-32 w-auto mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/logo.svg';
            }}
          />
        </div>

        {/* Branding */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-secondary mb-4">
            FUEGO AMIGO
          </h1>
          <p className="text-neutral-400 text-lg">
            Catering y foodtruck para eventos que se sienten
          </p>
        </div>

        {/* Access Form */}
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8">
          <h2 className="font-display text-2xl text-secondary mb-4">
            Acceso al sitio
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            Ingresá el código de acceso para continuar
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="Código de acceso"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded text-secondary text-center text-lg font-medium placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            
            {error && (
              <p className="text-accent text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full py-3 bg-accent text-secondary font-medium rounded hover:bg-accent/90 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-neutral-500 text-xs">
          Sitio en desarrollo - Acceso restringido
        </p>
      </div>
    </div>
  );
}

export function checkAccess(): boolean {
  return localStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
}
