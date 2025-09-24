-- Insert sample menu items with proper stock quantities
-- This will populate the inventory with actual data

-- First ensure categories exist
INSERT IGNORE INTO menu_categories (id, name, description, sort_order) VALUES
(1, 'Unlimited Menu', 'All-you-can-eat options', 1),
(2, 'Ala Carte Menu', 'Individual menu items', 2),
(3, 'Side Dishes', 'Complementary dishes', 3),
(4, 'Add Ons', 'Additional items and extras', 4);

-- Insert sample menu items with inventory quantities
INSERT IGNORE INTO menu_items (id, product_code, name, category_id, selling_price, purchase_price, quantity_in_stock, unit_type, availability, is_unlimited, is_premium) VALUES
(1, 'SET-A', 'SET A UNLI PORK', 1, 299.00, 250.00, 999, 'set', 'available', TRUE, FALSE),
(2, 'SET-B', 'SET B UNLI PORK & CHICKEN', 1, 349.00, 300.00, 999, 'set', 'available', TRUE, FALSE),
(3, 'SET-C', 'SET C UNLI PREMIUM PORK', 1, 399.00, 350.00, 999, 'set', 'available', TRUE, TRUE),
(4, 'SET-D', 'SET D UNLI PORK/CHICKEN & CHICKEN', 1, 449.00, 400.00, 999, 'set', 'available', TRUE, TRUE),
(5, 'SAMG-PORK', 'SAMG PORK ON CUP', 2, 89.00, 70.00, 45, 'cup', 'available', FALSE, FALSE),
(6, 'SAMG-CHICKEN', 'SAMG CHICKEN ON CUP', 2, 89.00, 70.00, 32, 'cup', 'available', FALSE, FALSE),
(7, 'SAMG-BEEF', 'SAMG BEEF ON CUP', 2, 99.00, 80.00, 28, 'cup', 'available', FALSE, FALSE),
(8, 'CHICKEN-POP', 'CHICKEN POPPERS ON CUP', 2, 79.00, 60.00, 15, 'cup', 'available', FALSE, FALSE),
(9, 'KOREAN-MEET', 'KOREAN MEET ON CUP', 2, 89.00, 70.00, 8, 'cup', 'low_stock', FALSE, FALSE),
(10, 'CHEESE', 'CHEESE', 2, 45.00, 35.00, 0, 'piece', 'out_of_stock', FALSE, FALSE),
(11, 'FISHCAKE', 'FISHCAKE ON TUB', 3, 65.00, 50.00, 22, 'tub', 'available', FALSE, FALSE),
(12, 'EGGROLL', 'EGGROLL ON TUB', 3, 55.00, 40.00, 18, 'tub', 'available', FALSE, FALSE),
(13, 'BABY-POTATO', 'BABY POTATOES ON TUB', 3, 60.00, 45.00, 25, 'tub', 'available', FALSE, FALSE),
(14, 'KIMCHI', 'KIMCHI ON TUB', 3, 50.00, 35.00, 12, 'tub', 'available', FALSE, FALSE),
(15, 'UNLI-CHEESE', 'UNLI CHEESE', 4, 75.00, 60.00, 35, 'serving', 'available', FALSE, FALSE);

-- Add some additional products to make the inventory more realistic
INSERT IGNORE INTO menu_items (product_code, name, category_id, selling_price, purchase_price, quantity_in_stock, unit_type, availability, is_unlimited, is_premium) VALUES
('RICE-PLAIN', 'Plain Rice', 3, 25.00, 15.00, 85, 'cup', 'available', FALSE, FALSE),
('RICE-GARLIC', 'Garlic Rice', 3, 35.00, 25.00, 65, 'cup', 'available', FALSE, FALSE),
('SAUCE-SOY', 'Soy Sauce', 4, 10.00, 5.00, 150, 'packet', 'available', FALSE, FALSE),
('SAUCE-CHILI', 'Chili Sauce', 4, 15.00, 8.00, 120, 'packet', 'available', FALSE, FALSE),
('DRINK-SODA', 'Softdrinks', 4, 45.00, 30.00, 48, 'bottle', 'available', FALSE, FALSE),
('DRINK-JUICE', 'Fresh Juice', 4, 65.00, 40.00, 25, 'glass', 'available', FALSE, FALSE),
('DESSERT-ICE', 'Ice Cream', 4, 55.00, 35.00, 18, 'scoop', 'available', FALSE, FALSE);
