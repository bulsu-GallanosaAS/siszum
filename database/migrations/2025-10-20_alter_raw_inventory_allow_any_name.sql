-- Allow arbitrary product names (not limited to Chicken/Pork/Beef)
-- Change ENUM to VARCHAR while preserving uniqueness

ALTER TABLE raw_meat_inventory
  MODIFY COLUMN name VARCHAR(100) NOT NULL;

-- Ensure a unique index on name still exists (some engines keep it, this is a safeguard)
SET @uniq_exists := (
  SELECT COUNT(1)
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = DATABASE()
    AND tc.table_name = 'raw_meat_inventory'
    AND tc.constraint_type = 'UNIQUE'
    AND tc.constraint_name = 'name'
);

-- If named unique constraint isn't found, ensure uniqueness via unique index
SET @idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'raw_meat_inventory'
    AND index_name = 'uniq_raw_meat_name'
);

SET @sql := IF(@idx_exists = 0,
  'CREATE UNIQUE INDEX uniq_raw_meat_name ON raw_meat_inventory(name)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
