-- Fuego Amigo: Migración inicial
-- Prefix: fuegoamigo_

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para tipo de producto
CREATE TYPE fuegoamigo_product_type AS ENUM ('standard', 'weighted', 'apparel', 'combo', 'service');

-- Enum para estado de orden
CREATE TYPE fuegoamigo_order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Enum para tipo de entrega
CREATE TYPE fuegoamigo_delivery_type AS ENUM ('entrega', 'retiro');

-- Enum para método de pago
CREATE TYPE fuegoamigo_payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'modo', 'mercado', 'billeteras-qr');

-- Sequence para order_number
CREATE SEQUENCE IF NOT EXISTS fuegoamigo_order_number_seq START 1000;

-- Site Config (1 row default)
CREATE TABLE IF NOT EXISTS fuegoamigo_site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_name TEXT NOT NULL DEFAULT 'Fuego Amigo',
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  zone TEXT,
  hours JSONB DEFAULT '{}'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  delivery_options JSONB DEFAULT '[]'::jsonb,
  wa_templates JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Blocks (CMS textos por sección)
CREATE TABLE IF NOT EXISTS fuegoamigo_content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  body TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS fuegoamigo_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS fuegoamigo_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES fuegoamigo_categories(id),
  product_type fuegoamigo_product_type DEFAULT 'standard',
  images TEXT[] DEFAULT '{}' CHECK (array_length(images, 1) <= 5),
  tags TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  -- Para productos weighted
  price_per_kg NUMERIC(10, 2),
  min_weight NUMERIC(10, 2),
  max_weight NUMERIC(10, 2),
  -- Para productos apparel (variantes)
  variants JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promos
CREATE TABLE IF NOT EXISTS fuegoamigo_promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banco TEXT NOT NULL,
  dia TEXT NOT NULL,
  tope_reintegro NUMERIC(10, 2) DEFAULT 0,
  porcentaje INTEGER DEFAULT 0,
  medios TEXT[] DEFAULT '{}',
  vigencia TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS fuegoamigo_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT,
  guests_range TEXT,
  highlight_menu TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}' CHECK (array_length(images, 1) <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS fuegoamigo_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users (PRIVATE - solo server role)
CREATE TABLE IF NOT EXISTS fuegoamigo_admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (PRIVATE - solo server role)
CREATE TABLE IF NOT EXISTS fuegoamigo_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number INTEGER UNIQUE NOT NULL DEFAULT nextval('fuegoamigo_order_number_seq'),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_type fuegoamigo_delivery_type NOT NULL,
  zone TEXT,
  payment_method fuegoamigo_payment_method NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  whatsapp_message TEXT,
  status fuegoamigo_order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Events (historial de estados)
CREATE TABLE IF NOT EXISTS fuegoamigo_order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES fuegoamigo_orders(id) ON DELETE CASCADE,
  status fuegoamigo_order_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Notes (notas internas)
CREATE TABLE IF NOT EXISTS fuegoamigo_order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES fuegoamigo_orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE fuegoamigo_site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_notes ENABLE ROW LEVEL SECURITY;

-- Policies públicas (SELECT solo)
CREATE POLICY "Public can read site_config" ON fuegoamigo_site_config FOR SELECT USING (true);
CREATE POLICY "Public can read content_blocks" ON fuegoamigo_content_blocks FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read categories" ON fuegoamigo_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read products" ON fuegoamigo_products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read promos" ON fuegoamigo_promos FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read events" ON fuegoamigo_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read faqs" ON fuegoamigo_faqs FOR SELECT USING (is_active = true);

-- Policies privadas (DENEGAR todo desde anon)
CREATE POLICY "Deny all admin_users" ON fuegoamigo_admin_users FOR ALL USING (false);
CREATE POLICY "Deny all orders" ON fuegoamigo_orders FOR ALL USING (false);
CREATE POLICY "Deny all order_events" ON fuegoamigo_order_events FOR ALL USING (false);
CREATE POLICY "Deny all order_notes" ON fuegoamigo_order_notes FOR ALL USING (false);

-- Denegar writes desde anon en tablas públicas
CREATE POLICY "Deny insert content_blocks" ON fuegoamigo_content_blocks FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update content_blocks" ON fuegoamigo_content_blocks FOR UPDATE USING (false);
CREATE POLICY "Deny delete content_blocks" ON fuegoamigo_content_blocks FOR DELETE USING (false);

CREATE POLICY "Deny insert categories" ON fuegoamigo_categories FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update categories" ON fuegoamigo_categories FOR UPDATE USING (false);
CREATE POLICY "Deny delete categories" ON fuegoamigo_categories FOR DELETE USING (false);

CREATE POLICY "Deny insert products" ON fuegoamigo_products FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update products" ON fuegoamigo_products FOR UPDATE USING (false);
CREATE POLICY "Deny delete products" ON fuegoamigo_products FOR DELETE USING (false);

CREATE POLICY "Deny insert promos" ON fuegoamigo_promos FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update promos" ON fuegoamigo_promos FOR UPDATE USING (false);
CREATE POLICY "Deny delete promos" ON fuegoamigo_promos FOR DELETE USING (false);

CREATE POLICY "Deny insert events" ON fuegoamigo_events FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update events" ON fuegoamigo_events FOR UPDATE USING (false);
CREATE POLICY "Deny delete events" ON fuegoamigo_events FOR DELETE USING (false);

CREATE POLICY "Deny insert faqs" ON fuegoamigo_faqs FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update faqs" ON fuegoamigo_faqs FOR UPDATE USING (false);
CREATE POLICY "Deny delete faqs" ON fuegoamigo_faqs FOR DELETE USING (false);

-- Insert default site_config
INSERT INTO fuegoamigo_site_config (brand_name, whatsapp, email, zone)
VALUES ('Fuego Amigo', '+5491141464526', 'fuegoamigo.resto@gmail.com', 'CABA y GBA')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO fuegoamigo_categories (slug, name, "order") VALUES
  ('boxes-y-regalos', 'Boxes y Regalos', 1),
  ('picadas-y-tablas', 'Picadas y Tablas', 2),
  ('ahumados', 'Ahumados', 3),
  ('salsas-y-aderezos', 'Salsas y Aderezos', 4),
  ('sandwiches-y-burgers', 'Sandwiches y Burgers', 5),
  ('finger-food', 'Finger Food', 6),
  ('postres', 'Postres', 7),
  ('combos', 'Combos', 8)
ON CONFLICT (slug) DO NOTHING;
