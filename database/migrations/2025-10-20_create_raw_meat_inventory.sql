-- Create a dedicated table for raw inventory (separate from menu_items)
-- Products are tracked by kilograms and NAME IS NOT LIMITED to specific meats

CREATE TABLE IF NOT EXISTS raw_meat_inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  buying_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity_kg DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ensure a UNIQUE index on `name` exists (required for upsert semantics)
-- This checks for ANY unique index on the `name` column
SET @uniq_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'raw_meat_inventory'
    AND column_name = 'name'
    AND non_unique = 0
);
SET @sql := IF(@uniq_idx_exists = 0,
  'CREATE UNIQUE INDEX uniq_raw_meat_name ON raw_meat_inventory(name)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional seed if table is empty
INSERT INTO raw_meat_inventory (name, buying_price, quantity_kg)
SELECT 'Chicken', 0.00, 0.000
WHERE NOT EXISTS (SELECT 1 FROM raw_meat_inventory WHERE name = 'Chicken');

INSERT INTO raw_meat_inventory (name, buying_price, quantity_kg)
SELECT 'Pork', 0.00, 0.000
WHERE NOT EXISTS (SELECT 1 FROM raw_meat_inventory WHERE name = 'Pork');

INSERT INTO raw_meat_inventory (name, buying_price, quantity_kg)
SELECT 'Beef', 0.00, 0.000
WHERE NOT EXISTS (SELECT 1 FROM raw_meat_inventory WHERE name = 'Beef');
