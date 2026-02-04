-- Fix RLS policies explicitly for anon role
-- This ensures the policies work correctly for anonymous users

-- Drop existing policies
DROP POLICY IF EXISTS "orders_insert_allow" ON fuegoamigo_orders;
DROP POLICY IF EXISTS "order_events_insert_allow" ON fuegoamigo_order_events;

-- Create policies explicitly for anon role
-- Using TO public allows all roles including anon
CREATE POLICY "orders_insert_allow" ON fuegoamigo_orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "order_events_insert_allow" ON fuegoamigo_order_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verify policies
SELECT 
  policyname, 
  cmd, 
  roles,
  qual, 
  with_check
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
ORDER BY tablename, policyname;
