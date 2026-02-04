-- Storage bucket para assets
-- Ejecutar manualmente desde Supabase Dashboard o usar Supabase CLI

-- Crear bucket privado
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fuegoamigo_assets',
  'fuegoamigo_assets',
  false,
  1572864, -- 1.5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (solo server role puede escribir)
CREATE POLICY "Deny all public access" ON storage.objects FOR ALL USING (bucket_id = 'fuegoamigo_assets');

-- Nota: Las policies de storage se manejan mejor desde el dashboard o con Supabase CLI
-- Este archivo es solo referencia. Ejecutar manualmente:
-- supabase storage create-bucket fuegoamigo_assets --public false --file-size-limit 1572864
