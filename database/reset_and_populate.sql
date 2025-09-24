-- SISZUM POS Database Reset and Population Script
-- This script wipes all data and repopulates with consistent sample data

-- ============================================
-- DISABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- CLEAR ALL DATA (IN CORRECT ORDER)
-- ============================================

-- Clear transaction-related tables first
DELETE FROM activity_logs;
DELETE FROM receipts;
DELETE FROM transactions;
DELETE FROM order_discounts;
DELETE FROM order_items;
DELETE FROM orders;

-- Clear customer and reservation data
DELETE FROM customer_timers;
DELETE FROM customer_feedback;
DELETE FROM refill_requests;
DELETE FROM reservations;
DELETE FROM customers;

-- Clear menu and restaurant data
DELETE FROM menu_items;
DELETE FROM menu_categories;
DELETE FROM restaurant_tables;
DELETE FROM discounts;

-- Clear admin data (keep structure, we'll add admin back)
DELETE FROM admins;

-- Reset auto increment values
ALTER TABLE activity_logs AUTO_INCREMENT = 1;
ALTER TABLE receipts AUTO_INCREMENT = 1;
ALTER TABLE transactions AUTO_INCREMENT = 1;
ALTER TABLE order_discounts AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE customer_timers AUTO_INCREMENT = 1;
ALTER TABLE customer_feedback AUTO_INCREMENT = 1;
ALTER TABLE refill_requests AUTO_INCREMENT = 1;
ALTER TABLE reservations AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE menu_items AUTO_INCREMENT = 1;
ALTER TABLE menu_categories AUTO_INCREMENT = 1;
ALTER TABLE restaurant_tables AUTO_INCREMENT = 1;
ALTER TABLE discounts AUTO_INCREMENT = 1;
ALTER TABLE admins AUTO_INCREMENT = 1;

-- ============================================
-- POPULATE REFERENCE DATA
-- ============================================

-- Insert admin user (password: admin123)
INSERT INTO admins (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@siszumpos.com', '$2b$12$1F3Fic5Im2afY/h08p46.eExcDgi6aHgaTtkx/1R9KnRBecZeSWCu', 'System', 'Administrator', 'super_admin');

-- Insert menu categories
INSERT INTO menu_categories (id, name, description, sort_order) VALUES
(1, 'Unlimited Menu', 'All-you-can-eat options', 1),
(2, 'Ala Carte Menu', 'Individual menu items', 2),
(3, 'Side Dishes', 'Complementary dishes', 3),
(4, 'Add Ons', 'Additional items and extras', 4);

-- Insert discounts
INSERT INTO discounts (id, name, code, type, value, description) VALUES
(1, 'Senior Citizen Discount', 'SENIOR', 'percentage', 20.00, '20% discount for senior citizens'),
(2, 'PWD Discount', 'PWD', 'percentage', 20.00, '20% discount for persons with disability'),
(3, 'Left Overs Fee', 'LEFTOVER', 'fixed_amount', 25.00, 'Fee for leftover food');

-- Insert restaurant tables
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

-- Insert menu items
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

-- Insert customers
INSERT INTO customers (id, customer_code, first_name, last_name, email, phone, city, country, is_active) VALUES
(1, 'CUST0001', 'Maria', 'Santos', 'maria.santos@email.com', '09171234567', 'Manila', 'Philippines', TRUE),
(2, 'CUST0002', 'Juan', 'Dela Cruz', 'juan.delacruz@email.com', '09281234567', 'Quezon City', 'Philippines', TRUE),
(3, 'CUST0003', 'Ana', 'Garcia', 'ana.garcia@email.com', '09391234567', 'Makati', 'Philippines', TRUE),
(4, 'CUST0004', 'Pedro', 'Rodriguez', 'pedro.rodriguez@email.com', '09401234567', 'Pasig', 'Philippines', TRUE),
(5, 'CUST0005', 'Carmen', 'Lopez', 'carmen.lopez@email.com', '09511234567', 'Cavite', 'Philippines', TRUE),
(6, 'CUST0006', 'Roberto', 'Mendoza', 'roberto.mendoza@email.com', '09621234567', 'Pampanga', 'Philippines', TRUE),
(7, 'CUST0007', 'Rosa', 'Fernandez', 'rosa.fernandez@email.com', '09731234567', 'Taguig', 'Philippines', TRUE),
(8, 'CUST0008', 'Miguel', 'Torres', 'miguel.torres@email.com', '09841234567', 'Muntinlupa', 'Philippines', TRUE),
(9, 'CUST0009', 'Elena', 'Ramos', 'elena.ramos@email.com', '09951234567', 'Marikina', 'Philippines', TRUE),
(10, 'CUST0010', 'Jose', 'Morales', 'jose.morales@email.com', '09061234567', 'Mandaluyong', 'Philippines', TRUE);

-- ============================================
-- POPULATE SAMPLE ORDERS AND TRANSACTIONS
-- ============================================

-- Insert orders for the last 30 days
INSERT INTO orders (id, order_code, customer_id, customer_name, table_id, order_type, subtotal, discount_amount, tax_amount, total_amount, status, payment_status, order_date, order_time, completed_at, created_by) VALUES
-- Recent orders (last 7 days)
(1, 'ORD20250817001', 1, 'Maria Santos', 1, 'dine_in', 398.00, 0.00, 47.76, 445.76, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:30:00', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 90 MINUTE, 1),
(2, 'ORD20250817002', 2, 'Juan Dela Cruz', 3, 'dine_in', 748.00, 0.00, 89.76, 837.76, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:15:00', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 120 MINUTE, 1),
(3, 'ORD20250816001', 3, 'Ana Garcia', 2, 'dine_in', 233.00, 0.00, 27.96, 260.96, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '18:45:00', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 85 MINUTE, 1),
(4, 'ORD20250815001', 4, 'Pedro Rodriguez', 4, 'dine_in', 399.00, 0.00, 47.88, 446.88, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '20:00:00', DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 95 MINUTE, 1),

-- Week 2 orders
(5, 'ORD20250814001', 5, 'Carmen Lopez', 5, 'dine_in', 164.00, 0.00, 19.68, 183.68, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY), '13:20:00', DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 75 MINUTE, 1),
(6, 'ORD20250813001', 6, 'Roberto Mendoza', 6, 'dine_in', 578.00, 0.00, 69.36, 647.36, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:30:00', DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 110 MINUTE, 1),
(7, 'ORD20250812001', 7, 'Rosa Fernandez', 7, 'dine_in', 349.00, 0.00, 41.88, 390.88, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 6 DAY), '17:45:00', DATE_SUB(NOW(), INTERVAL 6 DAY) + INTERVAL 105 MINUTE, 1),
(8, 'ORD20250811001', 8, 'Miguel Torres', 8, 'dine_in', 298.00, 0.00, 35.76, 333.76, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 7 DAY), '21:00:00', DATE_SUB(NOW(), INTERVAL 7 DAY) + INTERVAL 80 MINUTE, 1),

-- Week 3 orders
(9, 'ORD20250810001', 9, 'Elena Ramos', 1, 'dine_in', 453.00, 0.00, 54.36, 507.36, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 8 DAY), '14:15:00', DATE_SUB(NOW(), INTERVAL 8 DAY) + INTERVAL 90 MINUTE, 1),
(10, 'ORD20250809001', 10, 'Jose Morales', 2, 'dine_in', 234.00, 0.00, 28.08, 262.08, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 9 DAY), '16:30:00', DATE_SUB(NOW(), INTERVAL 9 DAY) + INTERVAL 70 MINUTE, 1),
(11, 'ORD20250808001', 1, 'Maria Santos', 3, 'dine_in', 349.00, 0.00, 41.88, 390.88, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 10 DAY), '12:00:00', DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 85 MINUTE, 1),
(12, 'ORD20250807001', 2, 'Juan Dela Cruz', 4, 'dine_in', 567.00, 0.00, 68.04, 635.04, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 11 DAY), '20:15:00', DATE_SUB(NOW(), INTERVAL 11 DAY) + INTERVAL 115 MINUTE, 1),

-- Week 4 orders
(13, 'ORD20250806001', 3, 'Ana Garcia', 5, 'dine_in', 179.00, 0.00, 21.48, 200.48, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 12 DAY), '18:20:00', DATE_SUB(NOW(), INTERVAL 12 DAY) + INTERVAL 65 MINUTE, 1),
(14, 'ORD20250805001', 4, 'Pedro Rodriguez', 6, 'dine_in', 399.00, 0.00, 47.88, 446.88, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 13 DAY), '19:45:00', DATE_SUB(NOW(), INTERVAL 13 DAY) + INTERVAL 95 MINUTE, 1),
(15, 'ORD20250804001', 5, 'Carmen Lopez', 7, 'dine_in', 234.00, 0.00, 28.08, 262.08, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 14 DAY), '15:30:00', DATE_SUB(NOW(), INTERVAL 14 DAY) + INTERVAL 75 MINUTE, 1);

-- Insert order items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
-- Order 1: SET-A + FISHCAKE
(1, 1, 1, 299.00, 299.00),
(1, 11, 1, 65.00, 65.00),
(1, 10, 3, 45.00, 135.00),

-- Order 2: SET-B + SET-C
(2, 2, 1, 349.00, 349.00),
(2, 3, 1, 399.00, 399.00),

-- Order 3: SAMG items
(3, 5, 1, 89.00, 89.00),
(3, 6, 1, 89.00, 89.00),
(3, 12, 1, 55.00, 55.00),

-- Order 4: SET-C
(4, 3, 1, 399.00, 399.00),

-- Order 5: Side dishes
(5, 11, 1, 65.00, 65.00),
(5, 12, 1, 55.00, 55.00),
(5, 10, 1, 45.00, 45.00),

-- Order 6: SET-B + Sides
(6, 2, 1, 349.00, 349.00),
(6, 13, 2, 60.00, 120.00),
(6, 14, 2, 50.00, 100.00),
(6, 10, 2, 45.00, 90.00),

-- Order 7: SET-B
(7, 2, 1, 349.00, 349.00),

-- Order 8: SAMG + Sides
(8, 5, 1, 89.00, 89.00),
(8, 7, 1, 99.00, 99.00),
(8, 14, 2, 50.00, 100.00),
(8, 10, 1, 45.00, 45.00),

-- Order 9: SET-D
(9, 4, 1, 449.00, 449.00),
(9, 10, 1, 45.00, 45.00),

-- Order 10: Multiple items
(10, 8, 2, 79.00, 158.00),
(10, 11, 1, 65.00, 65.00),
(10, 10, 1, 45.00, 45.00),

-- Order 11: SET-B
(11, 2, 1, 349.00, 349.00),

-- Order 12: SET-A + Multiple sides
(12, 1, 1, 299.00, 299.00),
(12, 11, 1, 65.00, 65.00),
(12, 12, 1, 55.00, 55.00),
(12, 13, 2, 60.00, 120.00),
(12, 14, 1, 50.00, 50.00),

-- Order 13: Ala carte
(13, 6, 1, 89.00, 89.00),
(13, 10, 2, 45.00, 90.00),

-- Order 14: SET-C
(14, 3, 1, 399.00, 399.00),

-- Order 15: Multiple items
(15, 8, 2, 79.00, 158.00),
(15, 11, 1, 65.00, 65.00),
(15, 10, 1, 45.00, 45.00);

-- Insert transactions
INSERT INTO transactions (id, transaction_code, order_id, customer_id, payment_method, amount, status, reference_number, payment_date, payment_time, processed_by) VALUES
(1, 'TXN20250817001', 1, 1, 'cash', 445.76, 'completed', 'CASH001', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:35:00', 1),
(2, 'TXN20250817002', 2, 2, 'card', 837.76, 'completed', 'CARD002', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:20:00', 1),
(3, 'TXN20250816001', 3, 3, 'gcash', 260.96, 'completed', 'GCASH003', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '18:50:00', 1),
(4, 'TXN20250815001', 4, 4, 'cash', 446.88, 'completed', 'CASH004', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '20:05:00', 1),
(5, 'TXN20250814001', 5, 5, 'card', 183.68, 'completed', 'CARD005', DATE_SUB(CURDATE(), INTERVAL 4 DAY), '13:25:00', 1),
(6, 'TXN20250813001', 6, 6, 'gcash', 647.36, 'completed', 'GCASH006', DATE_SUB(CURDATE(), INTERVAL 5 DAY), '19:35:00', 1),
(7, 'TXN20250812001', 7, 7, 'cash', 390.88, 'completed', 'CASH007', DATE_SUB(CURDATE(), INTERVAL 6 DAY), '17:50:00', 1),
(8, 'TXN20250811001', 8, 8, 'card', 333.76, 'completed', 'CARD008', DATE_SUB(CURDATE(), INTERVAL 7 DAY), '21:05:00', 1),
(9, 'TXN20250810001', 9, 9, 'gcash', 507.36, 'completed', 'GCASH009', DATE_SUB(CURDATE(), INTERVAL 8 DAY), '14:20:00', 1),
(10, 'TXN20250809001', 10, 10, 'cash', 262.08, 'completed', 'CASH010', DATE_SUB(CURDATE(), INTERVAL 9 DAY), '16:35:00', 1),
(11, 'TXN20250808001', 1, 1, 'card', 390.88, 'completed', 'CARD011', DATE_SUB(CURDATE(), INTERVAL 10 DAY), '12:05:00', 1),
(12, 'TXN20250807001', 2, 2, 'gcash', 635.04, 'completed', 'GCASH012', DATE_SUB(CURDATE(), INTERVAL 11 DAY), '20:20:00', 1),
(13, 'TXN20250806001', 3, 3, 'cash', 200.48, 'completed', 'CASH013', DATE_SUB(CURDATE(), INTERVAL 12 DAY), '18:25:00', 1),
(14, 'TXN20250805001', 4, 4, 'card', 446.88, 'completed', 'CARD014', DATE_SUB(CURDATE(), INTERVAL 13 DAY), '19:50:00', 1),
(15, 'TXN20250804001', 5, 5, 'gcash', 262.08, 'completed', 'GCASH015', DATE_SUB(CURDATE(), INTERVAL 14 DAY), '15:35:00', 1);

-- Insert receipts for all completed orders
INSERT INTO receipts (receipt_number, order_id, transaction_id, customer_name, subtotal, discount_amount, tax_amount, total_amount) VALUES
('RCP20250817001', 1, 1, 'Maria Santos', 398.00, 0.00, 47.76, 445.76),
('RCP20250817002', 2, 2, 'Juan Dela Cruz', 748.00, 0.00, 89.76, 837.76),
('RCP20250816001', 3, 3, 'Ana Garcia', 233.00, 0.00, 27.96, 260.96),
('RCP20250815001', 4, 4, 'Pedro Rodriguez', 399.00, 0.00, 47.88, 446.88),
('RCP20250814001', 5, 5, 'Carmen Lopez', 164.00, 0.00, 19.68, 183.68),
('RCP20250813001', 6, 6, 'Roberto Mendoza', 578.00, 0.00, 69.36, 647.36),
('RCP20250812001', 7, 7, 'Rosa Fernandez', 349.00, 0.00, 41.88, 390.88),
('RCP20250811001', 8, 8, 'Miguel Torres', 298.00, 0.00, 35.76, 333.76),
('RCP20250810001', 9, 9, 'Elena Ramos', 453.00, 0.00, 54.36, 507.36),
('RCP20250809001', 10, 10, 'Jose Morales', 234.00, 0.00, 28.08, 262.08),
('RCP20250808001', 11, 11, 'Maria Santos', 349.00, 0.00, 41.88, 390.88),
('RCP20250807001', 12, 12, 'Juan Dela Cruz', 567.00, 0.00, 68.04, 635.04),
('RCP20250806001', 13, 13, 'Ana Garcia', 179.00, 0.00, 21.48, 200.48),
('RCP20250805001', 14, 14, 'Pedro Rodriguez', 399.00, 0.00, 47.88, 446.88),
('RCP20250804001', 15, 15, 'Carmen Lopez', 234.00, 0.00, 28.08, 262.08);

-- ============================================
-- POPULATE SAMPLE REFILL REQUESTS  
-- ============================================

INSERT INTO refill_requests (id, table_code, table_id, customer_id, status, request_type, price, requested_at, processed_by) VALUES
(1, '00001', 1, 1, 'pending', 'Pork Kimchi', 200.00, NOW() - INTERVAL 30 MINUTE, NULL),
(2, '00002', 2, 2, 'pending', 'Pork Kimchi', 200.00, NOW() - INTERVAL 15 MINUTE, NULL),
(3, '00003', 3, 3, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 45 MINUTE, 1),
(4, '00004', 4, 4, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 60 MINUTE, 1),
(5, '00005', 5, 5, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 75 MINUTE, 1),
(6, '00006', 6, 6, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 90 MINUTE, 1),
(7, '00007', 7, 7, 'pending', 'Pork Kimchi', 200.00, NOW() - INTERVAL 10 MINUTE, NULL),
(8, '00008', 8, 8, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 120 MINUTE, 1),
(9, '00009', 9, 9, 'on-going', 'Pork Kimchi', 200.00, NOW() - INTERVAL 105 MINUTE, 1),
(10, '00010', 10, 10, 'pending', 'Pork Kimchi', 200.00, NOW() - INTERVAL 5 MINUTE, NULL),
(11, '00011', 11, NULL, 'pending', 'Pork Kimchi', 200.00, NOW() - INTERVAL 20 MINUTE, NULL);

-- ============================================
-- POPULATE CUSTOMER TIMERS  
-- ============================================

INSERT INTO customer_timers (id, customer_name, table_id, order_id, start_time, end_time, elapsed_seconds, is_active) VALUES
(1, 'Maria Santos', 1, 1, NOW() - INTERVAL 30 MINUTE, NULL, 1800, TRUE),
(2, 'Juan Dela Cruz', 2, 2, NOW() - INTERVAL 15 MINUTE, NULL, 900, TRUE),
(3, 'Ana Garcia', 3, 3, NOW() - INTERVAL 45 MINUTE, NULL, 2700, TRUE),
(4, 'Pedro Rodriguez', 4, 4, NOW() - INTERVAL 60 MINUTE, NULL, 3600, TRUE),
(5, 'Carmen Lopez', 5, 5, NOW() - INTERVAL 75 MINUTE, NULL, 4500, TRUE),
(6, 'Roberto Mendoza', 6, 6, NOW() - INTERVAL 90 MINUTE, NULL, 5400, TRUE),
(7, 'Rosa Fernandez', 7, 7, NOW() - INTERVAL 10 MINUTE, NULL, 600, TRUE),
(8, 'Miguel Torres', 8, 8, NOW() - INTERVAL 120 MINUTE, NULL, 7200, TRUE),
(9, 'Elena Ramos', 9, 9, NOW() - INTERVAL 105 MINUTE, NULL, 6300, TRUE),
(10, 'Jose Morales', 10, 10, NOW() - INTERVAL 5 MINUTE, NULL, 300, TRUE),
(11, 'Walk-in Customer', 11, NULL, NOW() - INTERVAL 20 MINUTE, NULL, 1200, TRUE);

-- ============================================
-- POPULATE SAMPLE RESERVATIONS
-- ============================================

INSERT INTO reservations (id, reservation_code, customer_name, phone, email, reservation_date, reservation_time, number_of_guests, table_id, status, occasion, notes) VALUES
(1, 'RES20250818001', 'Carlos Rivera', '09171234567', 'carlos.rivera@email.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', 4, 1, 'confirmed', 'Birthday celebration', 'Requested corner table'),
(2, 'RES20250819001', 'Lisa Chen', '09281234567', 'lisa.chen@email.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:30:00', 6, 7, 'confirmed', 'Business dinner', 'Large group dinner'),
(3, 'RES20250818002', 'Mark Johnson', '09391234567', 'mark.johnson@email.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', 2, 5, 'pending', 'Lunch meeting', 'Lunch meeting'),
(4, 'RES20250820001', 'Sarah Williams', '09401234567', 'sarah.williams@email.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '20:00:00', 8, 7, 'confirmed', 'Anniversary dinner', 'Requested romantic setting'),
(5, 'RES20250818003', 'David Brown', '09511234567', 'david.brown@email.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', 3, 3, 'confirmed', 'Family dinner', 'Family dinner'),
(6, 'RES20250821001', 'Emily Davis', '09621234567', 'emily.davis@email.com', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:30:00', 5, 6, 'pending', 'Team meeting', 'Business dinner'),
(7, 'RES20250819002', 'Michael Wilson', '09731234567', 'michael.wilson@email.com', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', 4, 4, 'confirmed', 'Regular visit', 'Regular customer'),
(8, 'RES20250822001', 'Jessica Martinez', '09841234567', 'jessica.martinez@email.com', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '20:30:00', 6, 7, 'confirmed', 'Birthday party', 'Group celebration'),
(9, 'RES20250818004', 'Andrew Taylor', '09951234567', 'andrew.taylor@email.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:30:00', 2, 2, 'pending', 'Business lunch', 'Business lunch'),
(10, 'RES20250820002', 'Jennifer Garcia', '09061234567', 'jennifer.garcia@email.com', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00', 4, 1, 'confirmed', 'Wedding anniversary', 'Special occasion'),
(11, 'RES20250816001', 'Robert Lee', '09171234568', 'robert.lee@email.com', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:00:00', 3, 3, 'completed', 'Regular dinner', 'Completed reservation'),
(12, 'RES20250815001', 'Amanda Clark', '09281234568', 'amanda.clark@email.com', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '18:30:00', 5, 6, 'completed', 'Birthday dinner', 'Past reservation'),
(13, 'RES20250816002', 'Daniel Rodriguez', '09391234568', 'daniel.rodriguez@email.com', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:30:00', 2, 5, 'cancelled', 'Lunch', 'Customer cancelled'),
(14, 'RES20250824001', 'Michelle Thompson', '09401234568', 'michelle.thompson@email.com', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '19:30:00', 6, 7, 'confirmed', 'Team dinner', 'Corporate booking'),
(15, 'RES20250823001', 'Kevin Anderson', '09511234568', 'kevin.anderson@email.com', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '20:00:00', 4, 4, 'pending', 'Weekend dinner', 'Weekend reservation');

-- ============================================
-- POPULATE CUSTOMER FEEDBACK
-- ============================================

INSERT INTO customer_feedback (id, customer_id, order_id, rating, feedback_text, feedback_type) VALUES
(1, 1, 1, 5, 'Excellent food quality and service! The unlimited pork was amazing.', 'compliment'),
(2, 2, 2, 4, 'Good food but service was a bit slow during peak hours.', 'suggestion'),
(3, 3, 3, 5, 'Love the Korean flavors! Will definitely come back.', 'compliment'),
(4, 4, 4, 3, 'Food was okay but could use more variety in side dishes.', 'suggestion'),
(5, 5, 5, 5, 'Great value for money! Staff was very friendly.', 'compliment'),
(6, 6, 6, 4, 'Enjoyed the meal but the restaurant was quite noisy.', 'suggestion'),
(7, 7, 7, 5, 'Perfect place for family dinner. Kids loved the food!', 'compliment'),
(8, 8, 8, 2, 'Food took too long to arrive and was cold when served.', 'complaint'),
(9, 9, 9, 4, 'Good portion sizes and reasonable prices.', 'compliment'),
(10, 10, 10, 5, 'Outstanding service and delicious food. Highly recommended!', 'compliment'),
(11, 1, 11, 4, 'Great atmosphere but could improve the kimchi selection.', 'suggestion'),
(12, 2, 12, 5, 'Best Korean BBQ experience in the area!', 'compliment'),
(13, 3, 13, 3, 'Average experience. Nothing special but not bad either.', 'suggestion'),
(14, 4, 14, 5, 'Exceptional quality and presentation. Will bring friends!', 'compliment'),
(15, 5, 15, 4, 'Good food but parking is limited during busy hours.', 'suggestion');

-- ============================================
-- POPULATE ACTIVITY LOGS
-- ============================================

INSERT INTO activity_logs (id, user_id, user_type, action, table_name, record_id, old_values, new_values, ip_address) VALUES
(1, 1, 'admin', 'CREATE', 'orders', 1, NULL, '{"order_code": "ORD20250817001", "status": "completed"}', '127.0.0.1'),
(2, 1, 'admin', 'UPDATE', 'orders', 1, '{"status": "confirmed"}', '{"status": "completed"}', '127.0.0.1'),
(3, 1, 'admin', 'CREATE', 'customers', 11, NULL, '{"customer_name": "Walk-in Customer"}', '127.0.0.1'),
(4, 1, 'admin', 'CREATE', 'refill_requests', 1, NULL, '{"table_code": "00001", "status": "pending"}', '127.0.0.1'),
(5, 1, 'admin', 'UPDATE', 'refill_requests', 3, '{"status": "pending"}', '{"status": "on-going"}', '127.0.0.1'),
(6, 1, 'admin', 'CREATE', 'customer_timers', 1, NULL, '{"table_id": 1, "customer_name": "Maria Santos"}', '127.0.0.1'),
(7, 1, 'admin', 'UPDATE', 'restaurant_tables', 1, '{"status": "available"}', '{"status": "occupied"}', '127.0.0.1'),
(8, 1, 'admin', 'CREATE', 'transactions', 1, NULL, '{"transaction_code": "TXN20250817001", "amount": 445.76}', '127.0.0.1'),
(9, 1, 'admin', 'CREATE', 'orders', 2, NULL, '{"order_code": "ORD20250817002", "status": "completed"}', '127.0.0.1'),
(10, 1, 'admin', 'UPDATE', 'orders', 2, '{"status": "confirmed"}', '{"status": "completed"}', '127.0.0.1'),
(11, 1, 'admin', 'CREATE', 'reservations', 1, NULL, '{"reservation_code": "RES20250818001"}', '127.0.0.1'),
(12, 1, 'admin', 'UPDATE', 'menu_items', 8, '{"quantity_in_stock": 20}', '{"quantity_in_stock": 15}', '127.0.0.1'),
(13, 1, 'admin', 'CREATE', 'customer_feedback', 1, NULL, '{"rating": 5, "feedback_type": "compliment"}', '127.0.0.1'),
(14, 1, 'admin', 'UPDATE', 'customer_timers', 8, '{"elapsed_seconds": 7200}', '{"status": "overtime"}', '127.0.0.1'),
(15, 1, 'admin', 'CREATE', 'refill_requests', 7, NULL, '{"table_code": "00007", "status": "pending"}', '127.0.0.1'),
(16, 1, 'admin', 'UPDATE', 'reservations', 13, '{"status": "confirmed"}', '{"status": "cancelled"}', '127.0.0.1'),
(17, 1, 'admin', 'CREATE', 'orders', 16, NULL, '{"order_code": "ORD20250817003", "status": "preparing"}', '127.0.0.1'),
(18, 1, 'admin', 'UPDATE', 'menu_items', 9, '{"quantity_in_stock": 10}', '{"quantity_in_stock": 8}', '127.0.0.1'),
(19, 1, 'admin', 'CREATE', 'customer_timers', 12, NULL, '{"table_id": 11, "customer_name": "Walk-in Customer"}', '127.0.0.1'),
(20, 1, 'admin', 'UPDATE', 'refill_requests', 2, '{"status": "pending"}', '{"status": "completed"}', '127.0.0.1');

-- Insert some additional current orders (in-progress)
INSERT INTO orders (id, order_code, customer_id, customer_name, table_id, order_type, subtotal, discount_amount, tax_amount, total_amount, status, payment_status, order_date, order_time, created_by) VALUES
(16, 'ORD20250817003', 1, 'Maria Santos', 1, 'dine_in', 349.00, 0.00, 41.88, 390.88, 'preparing', 'pending', CURDATE(), '14:30:00', 1),
(17, 'ORD20250817004', 7, 'Rosa Fernandez', 7, 'dine_in', 578.00, 0.00, 69.36, 647.36, 'preparing', 'pending', CURDATE(), '15:15:00', 1),
(18, 'ORD20250817005', NULL, 'Walk-in Customer', 11, 'dine_in', 234.00, 0.00, 28.08, 262.08, 'confirmed', 'pending', CURDATE(), '15:45:00', 1);

-- Insert order items for current orders
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
-- Order 16
(16, 2, 1, 349.00, 349.00),

-- Order 17  
(17, 1, 1, 299.00, 299.00),
(17, 11, 2, 65.00, 130.00),
(17, 13, 2, 60.00, 120.00),
(17, 10, 1, 45.00, 45.00),

-- Order 18
(18, 8, 2, 79.00, 158.00),
(18, 11, 1, 65.00, 65.00),
(18, 10, 1, 45.00, 45.00);

-- Update table statuses based on active timers
UPDATE restaurant_tables SET status = 'occupied' WHERE id IN (1,2,3,4,5,6,7,8,9,10,11);

-- ============================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DATABASE RESET COMPLETE
-- ============================================

SELECT 'Database reset and population completed successfully!' as message;
SELECT 
  (SELECT COUNT(*) FROM customers) as customers_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM transactions) as transactions_count,
  (SELECT COUNT(*) FROM refill_requests) as refill_requests_count,
  (SELECT COUNT(*) FROM customer_timers) as active_timers_count;
