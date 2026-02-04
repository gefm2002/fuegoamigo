-- Create a function to insert orders that bypasses RLS issues
-- This function will run with SECURITY DEFINER, so it can insert regardless of RLS

CREATE OR REPLACE FUNCTION fuegoamigo_insert_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_type fuegoamigo_delivery_type,
  p_payment_method fuegoamigo_payment_method,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_total NUMERIC,
  p_customer_email TEXT DEFAULT NULL,
  p_zone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_whatsapp_message TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  order_number INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  delivery_type fuegoamigo_delivery_type,
  payment_method fuegoamigo_payment_method,
  total NUMERIC,
  status fuegoamigo_order_status,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number INTEGER;
BEGIN
  -- Insert the order
  INSERT INTO fuegoamigo_orders (
    customer_name,
    customer_email,
    customer_phone,
    delivery_type,
    zone,
    payment_method,
    items,
    subtotal,
    total,
    notes,
    whatsapp_message,
    status
  ) VALUES (
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_type,
    p_zone,
    p_payment_method,
    p_items,
    p_subtotal,
    p_total,
    p_notes,
    p_whatsapp_message,
    'pending'
  )
  RETURNING fuegoamigo_orders.id, fuegoamigo_orders.order_number INTO v_order_id, v_order_number;
  
  -- Create initial event
  INSERT INTO fuegoamigo_order_events (order_id, status, notes)
  VALUES (v_order_id, 'pending', 'Orden creada');
  
  -- Return the order data
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_phone,
    o.delivery_type,
    o.payment_method,
    o.total,
    o.status,
    o.created_at
  FROM fuegoamigo_orders o
  WHERE o.id = v_order_id;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION fuegoamigo_insert_order TO anon;
GRANT EXECUTE ON FUNCTION fuegoamigo_insert_order TO authenticated;

-- Verify the function was created
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'fuegoamigo_insert_order';
