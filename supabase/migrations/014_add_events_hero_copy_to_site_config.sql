ALTER TABLE fuegoamigo_site_config
ADD COLUMN IF NOT EXISTS events_hero_title TEXT,
ADD COLUMN IF NOT EXISTS events_hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS events_hero_primary_label TEXT,
ADD COLUMN IF NOT EXISTS events_hero_secondary_label TEXT,
ADD COLUMN IF NOT EXISTS events_hero_secondary_message TEXT;

