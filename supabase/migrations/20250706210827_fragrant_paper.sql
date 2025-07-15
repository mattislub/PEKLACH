/*
  # Add delivery methods to orders and admin settings

  1. Changes
    - Add delivery_method and delivery_price columns to orders table
    - Add delivery_address column to orders table
    - Add delivery_methods array to admin_settings table
    - Add store_address to admin_settings table

  2. Purpose
    - Enable multiple delivery methods with different pricing
    - Support distance-based and value-based delivery pricing
    - Store delivery information with orders
*/

-- Add delivery columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_price numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address jsonb;

-- Add delivery methods to admin_settings table
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS delivery_methods jsonb DEFAULT '[]'::jsonb;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS store_address jsonb DEFAULT '{
  "street": "123 Main Street",
  "city": "London",
  "state": "Greater London",
  "zipCode": "NW1 6XE",
  "latitude": 51.5074,
  "longitude": -0.1278
}'::jsonb;

-- Add default delivery methods if none exist
DO $$
BEGIN
  -- Check if delivery_methods is empty or null
  IF (SELECT delivery_methods IS NULL OR delivery_methods = '[]'::jsonb FROM admin_settings WHERE id = 'default') THEN
    -- Update with default delivery methods
    UPDATE admin_settings
    SET delivery_methods = '[
      {
        "id": "pickup",
        "name": "Store Pickup",
        "description": "Pick up your order from our store",
        "basePrice": 0,
        "isActive": true,
        "isDistanceBased": false,
        "isValueBased": false,
        "estimatedDeliveryDays": "Same day",
        "icon": "store"
      },
      {
        "id": "standard",
        "name": "Standard Delivery",
        "description": "Delivery within 3-5 business days",
        "basePrice": 4.99,
        "isActive": true,
        "isDistanceBased": true,
        "distancePricing": {
          "5": 4.99,
          "10": 6.99,
          "15": 8.99,
          "20": 10.99
        },
        "isValueBased": false,
        "freeShippingThreshold": 50,
        "estimatedDeliveryDays": "3-5 days",
        "icon": "truck"
      },
      {
        "id": "express",
        "name": "Express Delivery",
        "description": "Next day delivery",
        "basePrice": 9.99,
        "isActive": true,
        "isDistanceBased": true,
        "distancePricing": {
          "5": 9.99,
          "10": 12.99,
          "15": 14.99,
          "20": 19.99
        },
        "isValueBased": false,
        "freeShippingThreshold": 100,
        "estimatedDeliveryDays": "Next day",
        "icon": "zap"
      }
    ]'::jsonb
    WHERE id = 'default';
  END IF;
END $$;