-- Verify and fix RLS policies for orders
-- This script will show current policies and fix them

-- First, let's see what policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
ORDER BY tablename, policyname;

-- Now, drop ALL existing policies on fuegoamigo_orders using a DO block
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'fuegoamigo_orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_orders';
    END LOOP;
END $$;

-- Drop ALL existing policies on fuegoamigo_order_events
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'fuegoamigo_order_events') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_order_events';
    END LOOP;
END $$;

-- Create a simple INSERT policy for fuegoamigo_orders
-- This allows anyone (including anon) to INSERT
CREATE POLICY "orders_insert_allow" ON fuegoamigo_orders
  FOR INSERT
  WITH CHECK (true);

-- Create a simple INSERT policy for fuegoamigo_order_events
CREATE POLICY "order_events_insert_allow" ON fuegoamigo_order_events
  FOR INSERT
  WITH CHECK (true);

-- Verify the new policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
ORDER BY tablename, policyname;
