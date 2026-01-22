import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-display text-xl text-secondary mb-4">Fuego Amigo</h3>
            <p className="text-neutral-400 text-sm">
              Catering, eventos, producciones, foodtruck, ahumados y boxes.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-secondary mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-400 hover:text-secondary text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/eventos" className="text-neutral-400 hover:text-secondary text-sm transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link to="/tienda" className="text-neutral-400 hover:text-secondary text-sm transition-colors">
                  Tienda
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-neutral-400 hover:text-secondary text-sm transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-secondary mb-4">Contacto</h4>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>fuegoamigo.resto@gmail.com</li>
              <li>+54 9 11 4146-4526</li>
              <li>CABA y GBA</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-secondary mb-4">Redes</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/fuego_amigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-secondary text-sm transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 pt-6">
          <p className="text-neutral-500 text-xs text-center">
            Diseño y desarrollo por{' '}
            <a
              href="https://structura.com.ar/"
              target="_blank"
              rel="noopener"
              className="text-neutral-500 hover:text-neutral-300 hover:underline transition-colors"
            >
              Structura
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
