/*
  # Add simcha_date_example_text to labels table

  1. Changes
    - Add `simcha_date_example_text` column to the labels table
    - This column will store example text to show in the Simcha date field
    - Used to provide guidance for users on how to format Hebrew dates

  2. Purpose
    - Improve user experience by providing custom examples for different occasions
    - Allow admins to set specific format examples for each label type
*/

-- Add simcha_date_example_text column to labels table if it doesn't exist
ALTER TABLE labels ADD COLUMN IF NOT EXISTS simcha_date_example_text text;