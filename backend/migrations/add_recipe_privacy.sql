-- Add is_private column to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;

-- Add index for privacy filtering
CREATE INDEX IF NOT EXISTS idx_recipes_is_private ON recipes(is_private);
