-- Complete fix: Remove ALL policies and recreate only permissive ones
-- This ensures no restrictive policies are blocking

-- Step 1: Show all current policies (for debugging)
SELECT 
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

-- Step 2: Drop ALL policies using a more aggressive approach
DO $$ 
DECLARE
    r RECORD;
    sql_stmt TEXT;
BEGIN
    -- Drop policies on fuegoamigo_orders
    FOR r IN (
        SELECT policyname
        FROM pg_policies 
        WHERE tablename = 'fuegoamigo_orders'
    ) LOOP
        sql_stmt := 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_orders';
        EXECUTE sql_stmt;
        RAISE NOTICE 'Dropped policy: % on fuegoamigo_orders', r.policyname;
    END LOOP;
    
    -- Drop policies on fuegoamigo_order_events
    FOR r IN (
        SELECT policyname
        FROM pg_policies 
        WHERE tablename = 'fuegoamigo_order_events'
    ) LOOP
        sql_stmt := 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_order_events';
        EXECUTE sql_stmt;
        RAISE NOTICE 'Dropped policy: % on fuegoamigo_order_events', r.policyname;
    END LOOP;
END $$;

-- Step 3: Verify all policies are gone
SELECT 
  'Remaining policies after drop:' as status,
  COUNT(*) as count
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events');

-- Step 4: Create ONLY permissive policies for INSERT
-- These are explicitly permissive and allow INSERT for anon
CREATE POLICY "orders_insert_anon" ON fuegoamigo_orders
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "order_events_insert_anon" ON fuegoamigo_order_events
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 5: Final verification
SELECT 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
ORDER BY tablename, policyname;
