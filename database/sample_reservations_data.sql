-- Sample Reservation Data for Testing
-- Run this script in phpMyAdmin after setting up the database

-- Insert sample reservations
INSERT INTO reservations (
  reservation_code, customer_name, phone, email, table_id, occasion,
  number_of_guests, reservation_date, reservation_time, duration_hours,
  payment_amount, payment_status, status, notes
) VALUES
-- Today's reservations
('RES001', 'Johnny Tomacruz', '+639123456789', 'johnny@email.com', 1, 'Birthday', 4, CURDATE(), '18:00:00', 2, 500.00, 'paid', 'confirmed', 'Birthday celebration'),
('RES002', 'Maria Santos', '+639234567890', 'maria@email.com', 3, 'Date Night', 2, CURDATE(), '19:30:00', 2, 200.00, 'pending', 'pending', 'Anniversary dinner'),
('RES003', 'Juan Dela Cruz', '+639345678901', 'juan@email.com', 5, 'Family Dinner', 6, CURDATE(), '20:00:00', 2, 800.00, 'paid', 'confirmed', 'Family gathering'),

-- Tomorrow's reservations
('RES004', 'Anna Garcia', '+639456789012', 'anna@email.com', 2, 'Business Meeting', 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', 1, 300.00, 'pending', 'pending', 'Lunch meeting'),
('RES005', 'Pedro Reyes', '+639567890123', 'pedro@email.com', 4, 'Graduation', 8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', 3, 1200.00, 'paid', 'confirmed', 'Graduation party'),
('RES006', 'Lisa Wong', '+639678901234', 'lisa@email.com', 6, 'Date Night', 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', 2, 250.00, 'pending', 'pending', 'Romantic dinner'),

-- Next week reservations
('RES007', 'Carlos Mendoza', '+639789012345', 'carlos@email.com', 7, 'Team Building', 10, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', 4, 2000.00, 'pending', 'pending', 'Company team building'),
('RES008', 'Sofia Rodriguez', '+639890123456', 'sofia@email.com', 1, 'Baby Shower', 6, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '15:00:00', 3, 900.00, 'paid', 'confirmed', 'Baby shower celebration'),
('RES009', 'Miguel Torres', '+639901234567', 'miguel@email.com', 3, 'Wedding Anniversary', 2, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '20:30:00', 2, 400.00, 'pending', 'pending', '25th anniversary'),
('RES010', 'Carmen Flores', '+639012345678', 'carmen@email.com', 8, 'Retirement Party', 12, DATE_ADD(CURDATE(), INTERVAL 10 DAY), '18:30:00', 4, 2500.00, 'paid', 'confirmed', 'Retirement celebration'),

-- Past reservations (completed)
('RES011', 'Robert Kim', '+639123456780', 'robert@email.com', 2, 'Business Lunch', 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:30:00', 1, 350.00, 'paid', 'completed', 'Client meeting'),
('RES012', 'Diana Cruz', '+639234567891', 'diana@email.com', 4, 'Birthday', 5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '19:00:00', 2, 600.00, 'paid', 'completed', 'Sweet 16 party'),
('RES013', 'Antonio Lopez', '+639345678902', 'antonio@email.com', 6, 'Date Night', 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '20:00:00', 2, 280.00, 'paid', 'completed', 'First date'),

-- Cancelled reservations
('RES014', 'Elena Gonzalez', '+639456789013', 'elena@email.com', 5, 'Family Reunion', 8, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00', 3, 1000.00, 'cancelled', 'cancelled', 'Emergency cancellation'),
('RES015', 'Fernando Silva', '+639567890124', 'fernando@email.com', 7, 'Corporate Event', 15, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '14:00:00', 5, 3000.00, 'cancelled', 'cancelled', 'Event postponed');

-- Update some tables to show different statuses
UPDATE restaurant_tables SET status = 'occupied' WHERE id IN (1, 3);
UPDATE restaurant_tables SET status = 'reserved' WHERE id IN (2, 5);
UPDATE restaurant_tables SET status = 'maintenance' WHERE id = 8;

-- Add some customers for the reservations
INSERT INTO customers (customer_code, first_name, last_name, email, phone, city, country) VALUES
('CUST001', 'Johnny', 'Tomacruz', 'johnny@email.com', '+639123456789', 'Manila', 'Philippines'),
('CUST002', 'Maria', 'Santos', 'maria@email.com', '+639234567890', 'Quezon City', 'Philippines'),
('CUST003', 'Juan', 'Dela Cruz', 'juan@email.com', '+639345678901', 'Makati', 'Philippines'),
('CUST004', 'Anna', 'Garcia', 'anna@email.com', '+639456789012', 'Pasig', 'Philippines'),
('CUST005', 'Pedro', 'Reyes', 'pedro@email.com', '+639567890123', 'Taguig', 'Philippines'),
('CUST006', 'Lisa', 'Wong', 'lisa@email.com', '+639678901234', 'Mandaluyong', 'Philippines'),
('CUST007', 'Carlos', 'Mendoza', 'carlos@email.com', '+639789012345', 'Parañaque', 'Philippines'),
('CUST008', 'Sofia', 'Rodriguez', 'sofia@email.com', '+639890123456', 'Las Piñas', 'Philippines'),
('CUST009', 'Miguel', 'Torres', 'miguel@email.com', '+639901234567', 'Muntinlupa', 'Philippines'),
('CUST010', 'Carmen', 'Flores', 'carmen@email.com', '+639012345678', 'Marikina', 'Philippines');

-- Add some sample orders related to past reservations
INSERT INTO orders (
  order_code, customer_name, table_id, order_type, subtotal, 
  tax_amount, total_amount, status, payment_status, order_date, order_time
) VALUES
('ORD001', 'Robert Kim', 2, 'dine_in', 300.00, 30.00, 330.00, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '12:30:00'),
('ORD002', 'Diana Cruz', 4, 'dine_in', 550.00, 55.00, 605.00, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '19:00:00'),
('ORD003', 'Antonio Lopez', 6, 'dine_in', 250.00, 25.00, 275.00, 'completed', 'paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '20:00:00');

-- Add sample order items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price) VALUES
-- Order 1 items
(1, 1, 2, 299.00, 598.00), -- SET A UNLI PORK
(1, 11, 1, 65.00, 65.00),  -- FISHCAKE ON TUB

-- Order 2 items  
(2, 2, 1, 349.00, 349.00), -- SET B UNLI PORK & CHICKEN
(2, 3, 1, 399.00, 399.00), -- SET C UNLI PREMIUM PORK
(2, 15, 2, 75.00, 150.00), -- UNLI CHEESE

-- Order 3 items
(3, 5, 1, 89.00, 89.00),   -- SAMG PORK ON CUP
(3, 6, 1, 89.00, 89.00),   -- SAMG CHICKEN ON CUP
(3, 12, 1, 55.00, 55.00);  -- EGGROLL ON TUB

-- Add sample transactions
INSERT INTO transactions (
  transaction_code, order_id, payment_method, amount, status, 
  payment_date, payment_time, reference_number
) VALUES
('TXN001', 1, 'cash', 330.00, 'completed', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '13:15:00', 'CASH001'),
('TXN002', 2, 'card', 605.00, 'completed', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '20:30:00', 'CARD002'),
('TXN003', 3, 'gcash', 275.00, 'completed', DATE_SUB(CURDATE(), INTERVAL 3 DAY), '21:15:00', 'GCASH003');
