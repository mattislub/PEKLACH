/*
  # Initial database schema for YH Pecklech platform

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `products` - Product inventory
    - `customers` - Customer information
    - `orders` - Order details and status
    - `occasions` - Jewish occasions
    - `bags` - Bag inventory
    - `labels` - Label designs
    - `budget_choice_peckels` - Budget choice options
    - `ready_to_go_peckels` - Ready-to-go packages
    - `admin_settings` - System settings

  2. Security
    - Enable RLS on all tables
    - Create policies for each table
    - Set up user creation trigger

  3. Initial Data
    - Default admin settings
*/

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text,
  email text UNIQUE,
  role text DEFAULT 'customer',
  phone text,
  phone2 text,
  phone3 text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric,
  is_on_promotion boolean DEFAULT false,
  image text,
  category text,
  stock integer DEFAULT 0,
  sku text,
  is_visible boolean DEFAULT true,
  customer_visible boolean DEFAULT true,
  allow_custom_order boolean DEFAULT false,
  minimum_stock integer DEFAULT 0,
  visible_occasions text[],
  visibility_settings jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  phone2 text,
  phone3 text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer jsonb NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'pending',
  order_date timestamptz DEFAULT now(),
  order_type text DEFAULT 'online',
  notes text,
  occasion text,
  hebrew_date text,
  parsha text,
  day_of_week text,
  hebrew_day_of_week text,
  ordering_method text,
  selected_bag jsonb,
  selected_label jsonb,
  custom_label_design text,
  personal_text text,
  simcha_date text,
  delivery_date text,
  peckel_quantity integer,
  payment_link text,
  payment_status text,
  payment_id text,
  invoice_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create occasions table
CREATE TABLE IF NOT EXISTS occasions (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text,
  is_visible_on_storefront boolean DEFAULT true,
  display_order integer,
  scheduled_visibility jsonb,
  description text,
  color text,
  image text,
  manual_override jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bags table
CREATE TABLE IF NOT EXISTS bags (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image text,
  color text,
  size text,
  stock integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  minimum_stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create labels table
CREATE TABLE IF NOT EXISTS labels (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  design_image text,
  is_pre_designed boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  visible_occasions text[],
  show_simcha_date_field boolean DEFAULT false,
  simcha_date_occasions text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budget_choice_peckels table
CREATE TABLE IF NOT EXISTS budget_choice_peckels (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image text,
  sample_items jsonb,
  bag jsonb,
  color text,
  is_visible boolean DEFAULT true,
  occasions text[],
  features text[],
  allow_bag_selection boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ready_to_go_peckels table
CREATE TABLE IF NOT EXISTS ready_to_go_peckels (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image text,
  items jsonb,
  bag jsonb,
  stock integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  occasions text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id text PRIMARY KEY DEFAULT 'default',
  alert_email text,
  email_notifications boolean DEFAULT true,
  ordering_methods jsonb,
  sumup_enabled boolean DEFAULT true,
  sumup_merchant_code text,
  sumup_api_key text,
  auto_generate_invoices boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_choice_peckels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_to_go_peckels ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for customers
CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for occasions
CREATE POLICY "Anyone can view occasions"
  ON occasions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert occasions"
  ON occasions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update occasions"
  ON occasions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete occasions"
  ON occasions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for bags
CREATE POLICY "Anyone can view bags"
  ON bags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert bags"
  ON bags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update bags"
  ON bags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete bags"
  ON bags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for labels
CREATE POLICY "Anyone can view labels"
  ON labels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert labels"
  ON labels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update labels"
  ON labels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete labels"
  ON labels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for budget_choice_peckels
CREATE POLICY "Anyone can view budget_choice_peckels"
  ON budget_choice_peckels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert budget_choice_peckels"
  ON budget_choice_peckels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update budget_choice_peckels"
  ON budget_choice_peckels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete budget_choice_peckels"
  ON budget_choice_peckels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for ready_to_go_peckels
CREATE POLICY "Anyone can view ready_to_go_peckels"
  ON ready_to_go_peckels FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert ready_to_go_peckels"
  ON ready_to_go_peckels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can update ready_to_go_peckels"
  ON ready_to_go_peckels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Admins can delete ready_to_go_peckels"
  ON ready_to_go_peckels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create policies for admin_settings
CREATE POLICY "Anyone can view admin_settings"
  ON admin_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update admin_settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert default admin settings
INSERT INTO admin_settings (
  id, 
  alert_email, 
  email_notifications, 
  ordering_methods, 
  sumup_enabled, 
  sumup_merchant_code, 
  sumup_api_key, 
  auto_generate_invoices
)
VALUES (
  'default',
  '',
  true,
  '{
    "readyToGo": {
      "title": "Ready to Go Pecklech",
      "description": "Pre-packed Pecklech ready for immediate purchase. Choose from our selection of beautifully prepared packages.",
      "features": [
        "Immediately available",
        "Pre-selected quality items",
        "Professional packaging",
        "Quick checkout process"
      ]
    },
    "budgetChoice": {
      "title": "Your Budget, Our Choice",
      "description": "Tell us your budget and preferred style, and we''ll create the perfect Pecklech for you.",
      "features": [
        "Budget-friendly options",
        "Expert item selection",
        "Various price ranges",
        "Surprise element"
      ]
    },
    "buildPeckel": {
      "title": "Build a Peckel",
      "description": "Create your own custom Pecklech step by step. Choose your bag, items, and personalization options.",
      "features": [
        "Complete customization",
        "Choose every item",
        "Select bag and label",
        "Personal touch"
      ]
    }
  }',
  true,
  'demo_merchant_code',
  'demo_api_key',
  true
)
ON CONFLICT (id) DO NOTHING;