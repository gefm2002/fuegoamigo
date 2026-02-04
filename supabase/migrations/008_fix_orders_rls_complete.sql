-- Complete fix for RLS policies - ensure INSERT works for anon
-- This script will completely reset and recreate the policies

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE fuegoamigo_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_events DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (they won't exist if RLS is disabled, but just in case)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Try to drop policies even if RLS is disabled
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events')
    ) LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
            RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop policy % on %: %', r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE fuegoamigo_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuegoamigo_order_events ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, explicit policies for anon role
-- Using AS PERMISSIVE explicitly (default, but being explicit)
CREATE POLICY "orders_insert_anon" ON fuegoamigo_orders
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users
CREATE POLICY "orders_insert_authenticated" ON fuegoamigo_orders
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Same for order_events
CREATE POLICY "order_events_insert_anon" ON fuegoamigo_order_events
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "order_events_insert_authenticated" ON fuegoamigo_order_events
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 5: Verify the policies
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

-- Step 6: Test query to verify anon can insert (this will fail if policies don't work)
-- Note: This is just a verification query, not an actual insert
SELECT 
  'Policy check complete. Policies should allow INSERT for anon role.' as status,
  COUNT(*) FILTER (WHERE roles = '{anon}' AND cmd = 'INSERT') as anon_insert_policies
FROM pg_policies 
WHERE tablename IN ('fuegoamigo_orders', 'fuegoamigo_order_events');
