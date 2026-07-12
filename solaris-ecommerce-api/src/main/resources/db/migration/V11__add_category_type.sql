-- Add category_type column to support 3-level menu hierarchy (MENU -> SUBMENU -> ITEM)
ALTER TABLE categories ADD COLUMN category_type VARCHAR(20) NOT NULL DEFAULT 'ITEM';

-- Update existing categories: those without parent become MENU, those with parent become SUBMENU
UPDATE categories SET category_type = 'MENU' WHERE parent_id IS NULL;
UPDATE categories SET category_type = 'SUBMENU' WHERE parent_id IS NOT NULL;
