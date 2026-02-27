-- Home hero copy customization in site config

ALTER TABLE fuegoamigo_site_config
  ADD COLUMN IF NOT EXISTS home_hero_title TEXT,
  ADD COLUMN IF NOT EXISTS home_hero_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS home_hero_primary_label TEXT,
  ADD COLUMN IF NOT EXISTS home_hero_secondary_label TEXT,
  ADD COLUMN IF NOT EXISTS home_hero_secondary_message TEXT,
  ADD COLUMN IF NOT EXISTS home_hero_chips JSONB DEFAULT '[]'::jsonb;

