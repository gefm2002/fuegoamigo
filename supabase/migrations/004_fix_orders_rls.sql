-- Fix RLS policies for orders to allow INSERT from anonymous users
-- This allows the checkout process to create orders

-- Use a DO block to dynamically drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on fuegoamigo_orders
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'fuegoamigo_orders'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_orders';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
    
    -- Drop all policies on fuegoamigo_order_events
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'fuegoamigo_order_events'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON fuegoamigo_order_events';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
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
