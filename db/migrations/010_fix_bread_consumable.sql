-- Fix Bread to be a proper consumable
UPDATE items SET health_restore = 20 WHERE name = 'Bread';
