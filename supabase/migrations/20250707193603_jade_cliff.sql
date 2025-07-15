/*
  # Add Contact Information Fields to Admin Settings

  1. New Fields
    - `contact_email` - Business email address displayed on the website
    - `contact_phone` - Primary phone number displayed on the website
    - `contact_phone2` - Secondary phone number displayed on the website
    - `message_destination_email` - Email address where contact form messages are sent

  2. Purpose
    - Store business contact information for display on the website
    - Configure where contact form messages should be sent
*/

-- Add contact information fields to admin_settings table
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS contact_phone2 text;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS message_destination_email text;