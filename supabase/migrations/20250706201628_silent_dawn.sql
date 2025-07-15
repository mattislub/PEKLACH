/*
  # Inventory Batch Management with Expiry Dates

  1. New Tables
    - `product_batches` - Track inventory batches with expiry dates
    - `batch_transactions` - Track usage of batches

  2. Changes
    - Add batch management fields to products table
    - Add expiry notification settings

  3. Security
    - Enable RLS on new tables
    - Create policies for admin access
*/

-- Create product_batches table
CREATE TABLE IF NOT EXISTS product_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number text,
  quantity integer NOT NULL DEFAULT 0,
  received_date date NOT NULL,
  expiry_date date,
  has_expiry boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create batch_transactions table to track usage
CREATE TABLE IF NOT EXISTS batch_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES product_batches(id) ON DELETE CASCADE,
  order_id text REFERENCES orders(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  transaction_type text NOT NULL, -- 'sale', 'adjustment', 'return', etc.
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add expiry notification settings to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_expiry boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_notification_days integer DEFAULT 30;
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_fifo boolean DEFAULT true;

-- Enable Row Level Security
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for product_batches
CREATE POLICY "Admins can view product_batches"
  ON product_batches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can insert product_batches"
  ON product_batches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update product_batches"
  ON product_batches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete product_batches"
  ON product_batches FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for batch_transactions
CREATE POLICY "Admins can view batch_transactions"
  ON batch_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can insert batch_transactions"
  ON batch_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create function to update product stock when batch is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_stock_from_batches()
RETURNS TRIGGER AS $$
DECLARE
  total_stock integer;
BEGIN
  -- Calculate total stock from all batches
  SELECT COALESCE(SUM(quantity), 0) INTO total_stock
  FROM product_batches
  WHERE product_id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.product_id
    ELSE NEW.product_id
  END;
  
  -- Update the product's stock
  UPDATE products
  SET 
    stock = total_stock,
    updated_at = now()
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.product_id
    ELSE NEW.product_id
  END;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update product stock
CREATE TRIGGER after_batch_insert_update
  AFTER INSERT OR UPDATE ON product_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_from_batches();

CREATE TRIGGER after_batch_delete
  AFTER DELETE ON product_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock_from_batches();

-- Create function to handle batch transactions
CREATE OR REPLACE FUNCTION process_batch_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the batch quantity
  UPDATE product_batches
  SET 
    quantity = quantity - NEW.quantity,
    updated_at = now()
  WHERE id = NEW.batch_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for batch transactions
CREATE TRIGGER after_transaction_insert
  AFTER INSERT ON batch_transactions
  FOR EACH ROW
  EXECUTE FUNCTION process_batch_transaction();

-- Create function to get expiring products
CREATE OR REPLACE FUNCTION get_expiring_products(days_threshold integer DEFAULT 30)
RETURNS TABLE (
  product_id text,
  product_name text,
  batch_id uuid,
  batch_number text,
  quantity integer,
  expiry_date date,
  days_until_expiry integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    pb.id as batch_id,
    pb.batch_number,
    pb.quantity,
    pb.expiry_date,
    (pb.expiry_date - CURRENT_DATE) as days_until_expiry
  FROM 
    product_batches pb
    JOIN products p ON pb.product_id = p.id
  WHERE 
    pb.has_expiry = true
    AND pb.expiry_date IS NOT NULL
    AND pb.quantity > 0
    AND (pb.expiry_date - CURRENT_DATE) <= days_threshold
  ORDER BY 
    pb.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;