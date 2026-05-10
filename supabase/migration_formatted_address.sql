-- Run this in the Supabase SQL Editor
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS formatted_address TEXT;
