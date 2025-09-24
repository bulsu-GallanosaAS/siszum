-- Update existing menu items with proper stock quantities
-- This will fix the inventory display issue

UPDATE menu_items SET 
  quantity_in_stock = 999,
  purchase_price = selling_price * 0.8
WHERE is_unlimited = TRUE;

UPDATE menu_items SET 
  quantity_in_stock = CASE 
    WHEN product_code = 'SAMG-PORK' THEN 45
    WHEN product_code = 'SAMG-CHICKEN' THEN 32
    WHEN product_code = 'SAMG-BEEF' THEN 28
    WHEN product_code = 'CHICKEN-POP' THEN 15
    WHEN product_code = 'KOREAN-MEET' THEN 8
    WHEN product_code = 'CHEESE' THEN 0
    WHEN product_code = 'FISHCAKE' THEN 22
    WHEN product_code = 'EGGROLL' THEN 18
    WHEN product_code = 'BABY-POTATO' THEN 25
    WHEN product_code = 'KIMCHI' THEN 12
    WHEN product_code = 'UNLI-CHEESE' THEN 35
    ELSE 50
  END,
  purchase_price = CASE 
    WHEN purchase_price IS NULL OR purchase_price = 0 
    THEN selling_price * 0.75
    ELSE purchase_price
  END,
  availability = CASE 
    WHEN product_code = 'CHEESE' THEN 'out_of_stock'
    WHEN product_code = 'KOREAN-MEET' THEN 'available'
    ELSE 'available'
  END
WHERE is_unlimited = FALSE;

-- Also ensure unit_type is set properly
UPDATE menu_items SET 
  unit_type = CASE 
    WHEN product_code LIKE 'SET-%' THEN 'set'
    WHEN product_code LIKE '%CUP%' THEN 'cup'
    WHEN product_code LIKE '%TUB%' THEN 'tub'
    WHEN product_code = 'CHEESE' THEN 'piece'
    WHEN product_code = 'UNLI-CHEESE' THEN 'serving'
    ELSE 'piece'
  END
WHERE unit_type IS NULL OR unit_type = '';
