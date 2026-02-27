-- Add hero image fields to site config

ALTER TABLE fuegoamigo_site_config
  ADD COLUMN IF NOT EXISTS home_hero_image TEXT,
  ADD COLUMN IF NOT EXISTS events_hero_image TEXT;

