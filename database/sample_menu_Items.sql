-- Comprehensive update to populate all fields in menu_items table
-- This will ensure all columns have proper data

-- Update SET meals (Now with finite quantities)
UPDATE menu_items SET 
  description = CASE 
    WHEN product_code = 'SET-A' THEN 'Pork samgyupsal set with lettuce, rice, and basic side dishes'
    WHEN product_code = 'SET-B' THEN 'Pork and chicken set with premium side dishes and rice'
    WHEN product_code = 'SET-C' THEN 'Premium pork cuts set with special marinades and premium sides'
    WHEN product_code = 'SET-D' THEN 'Ultimate combo set with pork, chicken, and premium selections'
    ELSE description
  END,
  purchase_price = CASE 
    WHEN product_code = 'SET-A' THEN 240.00
    WHEN product_code = 'SET-B' THEN 280.00
    WHEN product_code = 'SET-C' THEN 320.00
    WHEN product_code = 'SET-D' THEN 360.00
    ELSE purchase_price
  END,
  purchase_value = CASE 
    WHEN product_code = 'SET-A' THEN 240.00 * 25
    WHEN product_code = 'SET-B' THEN 280.00 * 30
    WHEN product_code = 'SET-C' THEN 320.00 * 20
    WHEN product_code = 'SET-D' THEN 360.00 * 15
    ELSE purchase_value
  END,
  quantity_in_stock = CASE 
    WHEN product_code = 'SET-A' THEN 25
    WHEN product_code = 'SET-B' THEN 30
    WHEN product_code = 'SET-C' THEN 20
    WHEN product_code = 'SET-D' THEN 15
    ELSE quantity_in_stock
  END,
  unit_type = 'set',
  availability = 'available',
  is_unlimited = FALSE,
  is_premium = CASE 
    WHEN product_code IN ('SET-C', 'SET-D') THEN TRUE
    ELSE FALSE
  END
WHERE product_code LIKE 'SET-%';

-- Update Ala Carte items (SAMG series)
UPDATE menu_items SET 
  description = CASE 
    WHEN product_code = 'SAMG-PORK' THEN 'Marinated pork belly strips served in individual cup portion'
    WHEN product_code = 'SAMG-CHICKEN' THEN 'Seasoned chicken thigh cuts served in individual cup portion'
    WHEN product_code = 'SAMG-BEEF' THEN 'Premium beef bulgogi cuts served in individual cup portion'
    WHEN product_code = 'CHICKEN-POP' THEN 'Bite-sized chicken poppers with Korean seasoning'
    WHEN product_code = 'KOREAN-MEET' THEN 'Mixed Korean-style meat selection in cup serving'
    WHEN product_code = 'CHEESE' THEN 'Premium mozzarella cheese slices for grilling'
    ELSE description
  END,
  purchase_price = CASE 
    WHEN product_code = 'SAMG-PORK' THEN 65.00
    WHEN product_code = 'SAMG-CHICKEN' THEN 65.00
    WHEN product_code = 'SAMG-BEEF' THEN 75.00
    WHEN product_code = 'CHICKEN-POP' THEN 55.00
    WHEN product_code = 'KOREAN-MEET' THEN 65.00
    WHEN product_code = 'CHEESE' THEN 30.00
    ELSE purchase_price
  END,
  purchase_value = CASE 
    WHEN product_code = 'SAMG-PORK' THEN 65.00 * 45
    WHEN product_code = 'SAMG-CHICKEN' THEN 65.00 * 32
    WHEN product_code = 'SAMG-BEEF' THEN 75.00 * 28
    WHEN product_code = 'CHICKEN-POP' THEN 55.00 * 15
    WHEN product_code = 'KOREAN-MEET' THEN 65.00 * 8
    WHEN product_code = 'CHEESE' THEN 30.00 * 0
    ELSE purchase_value
  END,
  quantity_in_stock = CASE 
    WHEN product_code = 'SAMG-PORK' THEN 45
    WHEN product_code = 'SAMG-CHICKEN' THEN 32
    WHEN product_code = 'SAMG-BEEF' THEN 28
    WHEN product_code = 'CHICKEN-POP' THEN 15
    WHEN product_code = 'KOREAN-MEET' THEN 8
    WHEN product_code = 'CHEESE' THEN 0
    ELSE quantity_in_stock
  END,
  unit_type = CASE 
    WHEN product_code IN ('SAMG-PORK', 'SAMG-CHICKEN', 'SAMG-BEEF', 'CHICKEN-POP', 'KOREAN-MEET') THEN 'cup'
    WHEN product_code = 'CHEESE' THEN 'slice'
    ELSE unit_type
  END,
  availability = CASE 
    WHEN product_code = 'CHEESE' THEN 'out_of_stock'
    WHEN product_code = 'KOREAN-MEET' THEN 'available'
    ELSE 'available'
  END,
  is_unlimited = FALSE,
  is_premium = CASE 
    WHEN product_code = 'SAMG-BEEF' THEN TRUE
    ELSE FALSE
  END
WHERE product_code IN ('SAMG-PORK', 'SAMG-CHICKEN', 'SAMG-BEEF', 'CHICKEN-POP', 'KOREAN-MEET', 'CHEESE');

-- Update Side Dishes
UPDATE menu_items SET 
  description = CASE 
    WHEN product_code = 'FISHCAKE' THEN 'Korean-style fish cake strips in savory broth, served in tub'
    WHEN product_code = 'EGGROLL' THEN 'Crispy vegetable egg rolls with sweet and sour dipping sauce'
    WHEN product_code = 'BABY-POTATO' THEN 'Roasted baby potatoes with herbs and garlic seasoning'
    WHEN product_code = 'KIMCHI' THEN 'Traditional fermented cabbage kimchi, spicy and tangy'
    ELSE description
  END,
  purchase_price = CASE 
    WHEN product_code = 'FISHCAKE' THEN 45.00
    WHEN product_code = 'EGGROLL' THEN 35.00
    WHEN product_code = 'BABY-POTATO' THEN 40.00
    WHEN product_code = 'KIMCHI' THEN 30.00
    ELSE purchase_price
  END,
  purchase_value = CASE 
    WHEN product_code = 'FISHCAKE' THEN 45.00 * 22
    WHEN product_code = 'EGGROLL' THEN 35.00 * 18
    WHEN product_code = 'BABY-POTATO' THEN 40.00 * 25
    WHEN product_code = 'KIMCHI' THEN 30.00 * 12
    ELSE purchase_value
  END,
  quantity_in_stock = CASE 
    WHEN product_code = 'FISHCAKE' THEN 22
    WHEN product_code = 'EGGROLL' THEN 18
    WHEN product_code = 'BABY-POTATO' THEN 25
    WHEN product_code = 'KIMCHI' THEN 12
    ELSE quantity_in_stock
  END,
  unit_type = 'tub',
  availability = 'available',
  is_unlimited = FALSE,
  is_premium = FALSE
WHERE product_code IN ('FISHCAKE', 'EGGROLL', 'BABY-POTATO', 'KIMCHI');

-- Update Add-Ons
UPDATE menu_items SET 
  description = CASE 
    WHEN product_code = 'UNLI-CHEESE' THEN 'Premium cheese serving for grilling'
    ELSE description
  END,
  purchase_price = CASE 
    WHEN product_code = 'UNLI-CHEESE' THEN 50.00
    ELSE purchase_price
  END,
  purchase_value = CASE 
    WHEN product_code = 'UNLI-CHEESE' THEN 50.00 * 35
    ELSE purchase_value
  END,
  quantity_in_stock = CASE 
    WHEN product_code = 'UNLI-CHEESE' THEN 35
    ELSE quantity_in_stock
  END,
  unit_type = 'serving',
  availability = 'available',
  is_unlimited = FALSE,
  is_premium = TRUE
WHERE product_code = 'UNLI-CHEESE';

-- Add some additional items if they don't exist
INSERT IGNORE INTO menu_items (
  product_code, name, description, category_id, selling_price, purchase_price, 
  purchase_value, quantity_in_stock, unit_type, availability, is_unlimited, is_premium
) VALUES 
('RICE-PLAIN', 'Plain Rice', 'Steamed white rice, perfect complement to Korean BBQ', 3, 25.00, 12.00, 12.00 * 85, 85, 'cup', 'available', FALSE, FALSE),
('RICE-GARLIC', 'Garlic Rice', 'Fragrant garlic fried rice with Korean seasonings', 3, 35.00, 20.00, 20.00 * 65, 65, 'cup', 'available', FALSE, FALSE),
('SAUCE-SOY', 'Soy Sauce', 'Premium Korean soy sauce for dipping', 4, 10.00, 5.00, 5.00 * 150, 150, 'packet', 'available', FALSE, FALSE),
('SAUCE-CHILI', 'Chili Sauce', 'Spicy Korean chili sauce (gochujang)', 4, 15.00, 8.00, 8.00 * 120, 120, 'packet', 'available', FALSE, FALSE),
('DRINK-SODA', 'Soft Drinks', 'Assorted cold soft drinks', 4, 45.00, 25.00, 25.00 * 48, 48, 'bottle', 'available', FALSE, FALSE),
('DRINK-JUICE', 'Fresh Juice', 'Freshly squeezed fruit juices', 4, 65.00, 35.00, 35.00 * 25, 25, 'glass', 'available', FALSE, FALSE),
('DESSERT-ICE', 'Ice Cream', 'Korean-style ice cream dessert', 4, 55.00, 30.00, 30.00 * 18, 18, 'scoop', 'available', FALSE, FALSE);

-- Update timestamps and ensure no unlimited items
UPDATE menu_items SET 
  created_at = COALESCE(created_at, NOW()),
  updated_at = NOW(),
  is_unlimited = FALSE;

-- Verify the updates
SELECT 
  product_code, 
  name, 
  SUBSTRING(description, 1, 30) as description_preview,
  selling_price, 
  purchase_price, 
  quantity_in_stock, 
  unit_type, 
  availability,
  is_unlimited,
  is_premium
FROM menu_items 
ORDER BY category_id, name;
