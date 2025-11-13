-- Fix for missing privacy column in recipes table
-- Run this in DBeaver on your TastyHub database

-- Add privacy column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' AND column_name = 'privacy'
    ) THEN
        ALTER TABLE recipes 
        ADD COLUMN privacy VARCHAR(10) DEFAULT 'public' 
        CHECK (privacy IN ('public', 'private'));
        
        -- Update existing recipes to be public by default
        UPDATE recipes SET privacy = 'public' WHERE privacy IS NULL;
    END IF;
END $$;

-- Also ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
