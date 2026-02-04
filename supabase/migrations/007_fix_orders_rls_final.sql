-- Final fix for RLS policies - explicitly allow anon role
-- The issue is that policies with TO public might not work as expected
-- We need to explicitly target the anon role

-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
        RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- Create policies that explicitly allow INSERT for anon role
-- This is the key: we must specify TO anon explicitly
CREATE POLICY "orders_insert_anon" ON fuegoamigo_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow for authenticated users (in case someone logs in)
CREATE POLICY "orders_insert_authenticated" ON fuegoamigo_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Same for order_events
CREATE POLICY "order_events_insert_anon" ON fuegoamigo_order_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "order_events_insert_authenticated" ON fuegoamigo_order_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify the policies
SELECT 
  tablename, 
  policyname, 
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
ORDER BY tablename, policyname;
