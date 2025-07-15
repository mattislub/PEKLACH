/*
  # Add simcha_date_example_text column to labels table

  1. Changes
     - Add simcha_date_example_text column to labels table to store example text for the Simcha date field
*/

-- Add simcha_date_example_text column to labels table
ALTER TABLE labels ADD COLUMN IF NOT EXISTS simcha_date_example_text text;