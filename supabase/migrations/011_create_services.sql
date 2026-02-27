-- Create services table and seed default services

CREATE TABLE IF NOT EXISTS fuegoamigo_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fuegoamigo_services ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public can read services" ON fuegoamigo_services FOR SELECT USING (is_active = true);

-- Deny writes from anon
CREATE POLICY "Deny insert services" ON fuegoamigo_services FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update services" ON fuegoamigo_services FOR UPDATE USING (false);
CREATE POLICY "Deny delete services" ON fuegoamigo_services FOR DELETE USING (false);

-- Seed defaults (idempotent via slug)
INSERT INTO fuegoamigo_services (slug, title, short_description, long_description, image, is_active, "order")
VALUES
  (
    'catering-social',
    'Catering Social',
    'Eventos sociales, cumples, reuniones. Menús personalizados.',
    'Eventos sociales, cumples, reuniones familiares y celebraciones. Menús personalizados, opciones vegetarianas y sin TACC.\n\nIncluye:\n• Personal de servicio\n• Montaje y desmontaje\n• Coordinación previa',
    NULL,
    true,
    1
  ),
  (
    'catering-corporativo',
    'Catering Corporativo',
    'Lunchs, eventos corporativos, lanzamientos. Servicio completo.',
    'Catering para empresas y eventos corporativos.\n\nIncluye:\n• Menús ejecutivos y cocktail\n• Logística completa\n• Facturación a pedido',
    NULL,
    true,
    2
  ),
  (
    'producciones',
    'Producciones',
    'Moda, publicidad, sets. Boxes y servicio en locación.',
    'Servicio pensado para sets y producciones.\n\nIncluye:\n• Boxes individuales\n• Coordinación con producción\n• Servicio ágil en locación',
    NULL,
    true,
    3
  ),
  (
    'foodtruck-para-eventos',
    'Foodtruck para Eventos',
    'Foodtruck para ferias, eventos al aire libre y reuniones grandes.',
    'Foodtruck para ferias y eventos.\n\nIncluye:\n• Menú de parrilla y ahumados\n• Servicio continuo\n• Instalación en tu ubicación',
    NULL,
    true,
    4
  ),
  (
    'boxes-y-picadas',
    'Boxes y Picadas',
    'Boxes a pedido, picadas premium. Retiro o envío.',
    'Boxes y picadas premium para regalar o disfrutar.\n\nIncluye:\n• Opciones para 2 a 6 personas\n• Envío o retiro\n• Productos seleccionados',
    NULL,
    true,
    5
  ),
  (
    'ahumados-y-parrilla',
    'Ahumados y Parrilla',
    'Ahumados en vivo, parrilla premium. Servicio completo.',
    'Parrilla y ahumados en vivo para eventos.\n\nIncluye:\n• Parrillero\n• Ahumados premium\n• Salsas y acompañamientos',
    NULL,
    true,
    6
  )
ON CONFLICT (slug) DO NOTHING;

