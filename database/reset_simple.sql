-- SISZUM POS Database Reset Script for phpMyAdmin
-- Run this script section by section if needed

-- Step 1: Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Clear all data
DELETE FROM activity_logs;
DELETE FROM receipts; 
DELETE FROM transactions;
DELETE FROM order_discounts;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customer_timers;
DELETE FROM customer_feedback;
DELETE FROM refill_requests;
DELETE FROM reservations;
DELETE FROM customers;
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM restaurant_tables;
DELETE FROM discounts;
DELETE FROM admins;

-- Step 3: Reset auto increment
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE refill_requests AUTO_INCREMENT = 1;
ALTER TABLE customer_timers AUTO_INCREMENT = 1;
ALTER TABLE menu_items AUTO_INCREMENT = 1;
ALTER TABLE menu_categories AUTO_INCREMENT = 1;
ALTER TABLE restaurant_tables AUTO_INCREMENT = 1;
ALTER TABLE discounts AUTO_INCREMENT = 1;
ALTER TABLE admins AUTO_INCREMENT = 1;

-- Step 4: Insert admin user
INSERT INTO admins (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@siszumpos.com', '$2b$12$1F3Fic5Im2afY/h08p46.eExcDgi6aHgaTtkx/1R9KnRBecZeSWCu', 'System', 'Administrator', 'super_admin');

-- Step 5: Insert menu categories
INSERT INTO menu_categories (id, name, description, sort_order) VALUES
(1, 'Unlimited Menu', 'All-you-can-eat options', 1),
(2, 'Ala Carte Menu', 'Individual menu items', 2), 
(3, 'Side Dishes', 'Complementary dishes', 3),
(4, 'Add Ons', 'Additional items and extras', 4);

-- Step 6: Insert discounts
INSERT INTO discounts (id, name, code, type, value, description) VALUES
(1, 'Senior Citizen Discount', 'SENIOR', 'percentage', 20.00, '20% discount for senior citizens'),
(2, 'PWD Discount', 'PWD', 'percentage', 20.00, '20% discount for persons with disability'),
(3, 'Left Overs Fee', 'LEFTOVER', 'fixed_amount', 25.00, 'Fee for leftover food');

-- Step 7: Insert restaurant tables
INSERT INTO restaurant_tables (id, table_number, table_code, capacity, status) VALUES
(1, '1', '00001', 4, 'available'),
(2, '2', '00002', 4, 'available'),
(3, '3', '00003', 6, 'available'),
(4, '4', '00004', 4, 'available'),
(5, '5', '00005', 2, 'available'),
(6, '6', '00006', 4, 'available'),
(7, '7', '00007', 8, 'available'),
(8, '8', '00008', 4, 'available'),
(9, '9', '00009', 4, 'available'),
(10, '10', '00010', 4, 'available'),
(11, '11', '00011', 4, 'available');

-- Step 8: Insert menu items
INSERT INTO menu_items (id, product_code, name, category_id, selling_price, purchase_price, quantity_in_stock, unit_type, availability, is_unlimited, is_premium) VALUES
-- Unlimited Menu Sets
(1, 'SET-A', 'SET A UNLI PORK', 1, 299.00, 250.00, 999, 'set', 'available', TRUE, FALSE),
(2, 'SET-B', 'SET B UNLI PORK & CHICKEN', 1, 349.00, 300.00, 999, 'set', 'available', TRUE, FALSE),
(3, 'SET-C', 'SET C UNLI PREMIUM PORK', 1, 399.00, 350.00, 999, 'set', 'available', TRUE, TRUE),
(4, 'SET-D', 'SET D UNLI PREMIUM PORK & CHICKEN', 1, 449.00, 400.00, 999, 'set', 'available', TRUE, TRUE),
-- Ala Carte Menu
(5, 'SAMG-PORK', 'SAMG PORK ON CUP', 2, 89.00, 70.00, 45, 'cup', 'available', FALSE, FALSE),
(6, 'SAMG-CHICKEN', 'SAMG CHICKEN ON CUP', 2, 89.00, 70.00, 32, 'cup', 'available', FALSE, FALSE),
(7, 'SAMG-BEEF', 'SAMG BEEF ON CUP', 2, 99.00, 80.00, 28, 'cup', 'available', FALSE, FALSE),
(8, 'CHICKEN-POP', 'CHICKEN POPPERS ON CUP', 2, 79.00, 60.00, 15, 'cup', 'available', FALSE, FALSE),
(9, 'KOREAN-MEET', 'KOREAN MEET ON CUP', 2, 89.00, 70.00, 8, 'cup', 'available', FALSE, FALSE),
(10, 'CHEESE', 'CHEESE', 2, 45.00, 35.00, 25, 'slice', 'available', FALSE, FALSE),
-- Side Dishes
(11, 'FISHCAKE', 'FISHCAKE ON TUB', 3, 65.00, 50.00, 22, 'tub', 'available', FALSE, FALSE),
(12, 'EGGROLL', 'EGGROLL ON TUB', 3, 55.00, 40.00, 18, 'tub', 'available', FALSE, FALSE),
(13, 'BABY-POTATO', 'BABY POTATOES ON TUB', 3, 60.00, 45.00, 25, 'tub', 'available', FALSE, FALSE),
(14, 'KIMCHI', 'KIMCHI ON TUB', 3, 50.00, 35.00, 12, 'tub', 'available', FALSE, FALSE),
-- Add Ons
(15, 'UNLI-CHEESE', 'UNLI CHEESE', 4, 75.00, 60.00, 35, 'serving', 'available', FALSE, FALSE);

-- Step 9: Insert customers
INSERT INTO customers (id, customer_code, first_name, last_name, email, phone, city, country, is_active) VALUES
(1, 'CUST0001', 'Maria', 'Santos', 'maria.santos@email.com', '09171234567', 'Manila', 'Philippines', TRUE),
(2, 'CUST0002', 'Juan', 'Dela Cruz', 'juan.delacruz@email.com', '09281234567', 'Quezon City', 'Philippines', TRUE),
(3, 'CUST0003', 'Ana', 'Garcia', 'ana.garcia@email.com', '09391234567', 'Makati', 'Philippines', TRUE),
(4, 'CUST0004', 'Pedro', 'Rodriguez', 'pedro.rodriguez@email.com', '09401234567', 'Pasig', 'Philippines', TRUE),
(5, 'CUST0005', 'Carmen', 'Lopez', 'carmen.lopez@email.com', '09511234567', 'Cavite', 'Philippines', TRUE);

-- Step 10: Insert orders
INSERT INTO orders (id, order_code, customer_id, customer_name, table_id, order_type, subtotal, discount_amount, tax_amount, total_amount, status, payment_status, order_date, order_time, completed_at, created_by) VALUES
(1, 'ORD20250817001', 1, 'Maria Santos', 1, 'dine_in', 398.00, 0.00, 47.76, 445.76, 'completed', 'paid', '2025-08-16', '12:30:00', '2025-08-16 14:00:00', 1),
(2, 'ORD20250817002', 2, 'Juan Dela Cruz', 3, 'dine_in', 748.00, 0.00, 89.76, 837.76, 'completed', 'paid', '2025-08-16', '19:15:00', '2025-08-16 21:15:00', 1),
(3, 'ORD20250816001', 3, 'Ana Garcia', 2, 'dine_in', 233.00, 0.00, 27.96, 260.96, 'completed', 'paid', '2025-08-15', '18:45:00', '2025-08-15 20:10:00', 1);

-- Step 11: Insert order items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
-- Order 1
(1, 1, 1, 299.00, 299.00),
(1, 11, 1, 65.00, 65.00),
(1, 10, 1, 45.00, 45.00),
-- Order 2  
(2, 2, 1, 349.00, 349.00),
(2, 3, 1, 399.00, 399.00),
-- Order 3
(3, 5, 1, 89.00, 89.00),
(3, 6, 1, 89.00, 89.00),
(3, 12, 1, 55.00, 55.00);

-- Step 12: Insert transactions
INSERT INTO transactions (id, transaction_code, order_id, customer_id, payment_method, amount, status, reference_number, payment_date, payment_time, processed_by) VALUES
(1, 'TXN20250817001', 1, 1, 'cash', 445.76, 'completed', 'CASH001', '2025-08-16', '12:35:00', 1),
(2, 'TXN20250817002', 2, 2, 'card', 837.76, 'completed', 'CARD002', '2025-08-16', '19:20:00', 1),
(3, 'TXN20250816001', 3, 3, 'gcash', 260.96, 'completed', 'GCASH003', '2025-08-15', '18:50:00', 1);

-- Step 13: Insert receipts
INSERT INTO receipts (receipt_number, order_id, transaction_id, customer_name, subtotal, discount_amount, tax_amount, total_amount) VALUES
('RCP20250817001', 1, 1, 'Maria Santos', 398.00, 0.00, 47.76, 445.76),
('RCP20250817002', 2, 2, 'Juan Dela Cruz', 748.00, 0.00, 89.76, 837.76),
('RCP20250816001', 3, 3, 'Ana Garcia', 233.00, 0.00, 27.96, 260.96);

-- Step 14: Insert refill requests
INSERT INTO refill_requests (id, table_code, table_id, customer_id, status, request_type, price, requested_at, processed_by) VALUES
(1, '00001', 1, 1, 'pending', 'Pork Kimchi', 200.00, '2025-08-17 13:30:00', NULL),
(2, '00002', 2, 2, 'pending', 'Pork Kimchi', 200.00, '2025-08-17 13:45:00', NULL),
(3, '00003', 3, 3, 'on-going', 'Pork Kimchi', 200.00, '2025-08-17 13:15:00', 1);

-- Step 15: Insert customer timers
INSERT INTO customer_timers (id, customer_name, table_id, order_id, start_time, end_time, elapsed_seconds, is_active) VALUES
(1, 'Maria Santos', 1, 1, '2025-08-17 13:30:00', NULL, 1800, TRUE),
(2, 'Juan Dela Cruz', 2, 2, '2025-08-17 13:45:00', NULL, 900, TRUE),
(3, 'Ana Garcia', 3, 3, '2025-08-17 13:15:00', NULL, 2700, TRUE);

-- Step 16: Update table statuses
UPDATE restaurant_tables SET status = 'occupied' WHERE id IN (1,2,3);

-- Step 17: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Success message
SELECT 'Database reset completed successfully!' as message;
