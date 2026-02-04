-- Agregar campos nuevos a productos: descuento, oferta, por_pedido
ALTER TABLE fuegoamigo_products
ADD COLUMN IF NOT EXISTS discount_fixed NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_made_to_order BOOLEAN DEFAULT false;
