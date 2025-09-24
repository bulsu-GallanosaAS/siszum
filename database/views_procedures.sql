-- SISZUM POS Database Views and Stored Procedures
-- Additional database objects for enhanced functionality

-- ============================================
-- DATABASE VIEWS
-- ============================================

-- Dashboard statistics view
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() AND status IN ('pending', 'in_progress')) as total_orders,
    (SELECT COUNT(*) FROM reservations WHERE reservation_date = CURDATE() AND status = 'confirmed') as total_reservations,
    (SELECT COUNT(*) FROM refill_requests WHERE DATE(requested_at) = CURDATE() AND status = 'pending') as refill_requests,
    (SELECT SUM(total_amount) FROM transactions WHERE DATE(payment_date) = CURDATE() AND status = 'completed') as daily_revenue,
    (SELECT COUNT(*) FROM customer_timers WHERE is_active = TRUE) as active_customers;

-- Upcoming guests view
CREATE VIEW upcoming_guests AS
SELECT 
    r.id,
    r.customer_name,
    r.reservation_date,
    r.reservation_time,
    r.number_of_guests,
    rt.table_number,
    r.status,
    TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(r.reservation_date, ' ', r.reservation_time)) as minutes_until
FROM reservations r
LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
WHERE r.reservation_date = CURDATE() 
AND r.status = 'confirmed'
AND CONCAT(r.reservation_date, ' ', r.reservation_time) > NOW()
ORDER BY r.reservation_time ASC;

-- Active orders view
CREATE VIEW active_orders AS
SELECT 
    o.id,
    o.order_code,
    o.customer_name,
    rt.table_number,
    o.total_amount,
    o.status,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'in_progress')
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Inventory overview view
CREATE VIEW inventory_overview AS
SELECT 
    mc.name as category_name,
    COUNT(mi.id) as total_items,
    SUM(CASE WHEN mi.availability = 'available' THEN 1 ELSE 0 END) as available_items,
    SUM(CASE WHEN mi.availability = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock_items,
    AVG(mi.selling_price) as avg_price
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY mc.id, mc.name
ORDER BY mc.sort_order;

-- Customer accounts summary view
CREATE VIEW customer_accounts_summary AS
SELECT 
    c.id,
    c.customer_code,
    CONCAT(c.first_name, ' ', c.last_name) as full_name,
    c.email,
    c.phone,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.order_date) as last_order_date,
    COUNT(DISTINCT cf.id) as feedback_count,
    AVG(cf.rating) as avg_rating
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN customer_feedback cf ON c.id = cf.customer_id
WHERE c.is_active = TRUE
GROUP BY c.id
ORDER BY total_spent DESC;

-- Transaction summary view
CREATE VIEW transaction_summary AS
SELECT 
    DATE(t.payment_date) as transaction_date,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_revenue,
    AVG(t.amount) as avg_transaction,
    COUNT(CASE WHEN t.payment_method = 'cash' THEN 1 END) as cash_transactions,
    COUNT(CASE WHEN t.payment_method = 'card' THEN 1 END) as card_transactions,
    COUNT(CASE WHEN t.payment_method = 'gcash' THEN 1 END) as gcash_transactions
FROM transactions t
WHERE t.status = 'completed'
GROUP BY DATE(t.payment_date)
ORDER BY transaction_date DESC;

-- Active timers view
CREATE VIEW active_timers AS
SELECT 
    ct.id,
    ct.customer_name,
    rt.table_number,
    ct.start_time,
    TIMESTAMPDIFF(SECOND, ct.start_time, NOW()) as elapsed_seconds,
    TIME_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, ct.start_time, NOW())), '%H:%i:%s') as elapsed_time,
    o.order_code,
    o.total_amount
FROM customer_timers ct
JOIN restaurant_tables rt ON ct.table_id = rt.id
LEFT JOIN orders o ON ct.order_id = o.id
WHERE ct.is_active = TRUE
ORDER BY ct.start_time ASC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure to start customer timer
DELIMITER //
CREATE PROCEDURE StartCustomerTimer(
    IN p_customer_name VARCHAR(100),
    IN p_table_id INT,
    IN p_order_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- End any existing active timer for this table
    UPDATE customer_timers 
    SET is_active = FALSE, 
        end_time = NOW(),
        elapsed_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
    WHERE table_id = p_table_id AND is_active = TRUE;
    
    -- Start new timer
    INSERT INTO customer_timers (customer_name, table_id, order_id, start_time, is_active)
    VALUES (p_customer_name, p_table_id, p_order_id, NOW(), TRUE);
    
    -- Update table status to occupied
    UPDATE restaurant_tables SET status = 'occupied' WHERE id = p_table_id;
    
    COMMIT;
END //
DELIMITER ;

-- Procedure to stop customer timer
DELIMITER //
CREATE PROCEDURE StopCustomerTimer(
    IN p_timer_id INT
)
BEGIN
    DECLARE v_table_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get table_id before updating
    SELECT table_id INTO v_table_id FROM customer_timers WHERE id = p_timer_id;
    
    -- Stop timer
    UPDATE customer_timers 
    SET is_active = FALSE,
        end_time = NOW(),
        elapsed_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW())
    WHERE id = p_timer_id;
    
    -- Update table status to available
    UPDATE restaurant_tables SET status = 'available' WHERE id = v_table_id;
    
    COMMIT;
END //
DELIMITER ;

-- Procedure to process order payment
DELIMITER //
CREATE PROCEDURE ProcessOrderPayment(
    IN p_order_id INT,
    IN p_payment_method VARCHAR(20),
    IN p_amount DECIMAL(10,2),
    IN p_processed_by INT,
    OUT p_transaction_id INT
)
BEGIN
    DECLARE v_customer_id INT;
    DECLARE v_transaction_code VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get customer_id from order
    SELECT customer_id INTO v_customer_id FROM orders WHERE id = p_order_id;
    
    -- Generate transaction code
    SET v_transaction_code = CONCAT('TXN', LPAD(p_order_id, 6, '0'), UNIX_TIMESTAMP());
    
    -- Insert transaction
    INSERT INTO transactions (
        transaction_code, order_id, customer_id, payment_method, 
        amount, status, payment_date, payment_time, processed_by
    ) VALUES (
        v_transaction_code, p_order_id, v_customer_id, p_payment_method,
        p_amount, 'completed', CURDATE(), CURTIME(), p_processed_by
    );
    
    SET p_transaction_id = LAST_INSERT_ID();
    
    -- Update order payment status
    UPDATE orders SET payment_status = 'paid', status = 'completed' WHERE id = p_order_id;
    
    COMMIT;
END //
DELIMITER ;

-- Procedure to apply discount to order
DELIMITER //
CREATE PROCEDURE ApplyOrderDiscount(
    IN p_order_id INT,
    IN p_discount_id INT
)
BEGIN
    DECLARE v_discount_type VARCHAR(20);
    DECLARE v_discount_value DECIMAL(10,2);
    DECLARE v_order_subtotal DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2);
    DECLARE v_new_total DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get discount details
    SELECT type, value INTO v_discount_type, v_discount_value 
    FROM discounts WHERE id = p_discount_id;
    
    -- Get order subtotal
    SELECT subtotal INTO v_order_subtotal FROM orders WHERE id = p_order_id;
    
    -- Calculate discount amount
    IF v_discount_type = 'percentage' THEN
        SET v_discount_amount = (v_order_subtotal * v_discount_value) / 100;
    ELSE
        SET v_discount_amount = v_discount_value;
    END IF;
    
    -- Insert discount record
    INSERT INTO order_discounts (order_id, discount_id, discount_amount)
    VALUES (p_order_id, p_discount_id, v_discount_amount);
    
    -- Update order totals
    SET v_new_total = v_order_subtotal - v_discount_amount;
    UPDATE orders 
    SET discount_amount = discount_amount + v_discount_amount,
        total_amount = v_new_total
    WHERE id = p_order_id;
    
    COMMIT;
END //
DELIMITER ;

-- Procedure to generate receipt
DELIMITER //
CREATE PROCEDURE GenerateReceipt(
    IN p_order_id INT,
    OUT p_receipt_id INT
)
BEGIN
    DECLARE v_receipt_number VARCHAR(20);
    DECLARE v_customer_name VARCHAR(100);
    DECLARE v_subtotal, v_discount_amount, v_tax_amount, v_total_amount DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Generate receipt number
    SET v_receipt_number = CONCAT('RCP', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_order_id, 4, '0'));
    
    -- Get order details
    SELECT customer_name, subtotal, discount_amount, total_amount
    INTO v_customer_name, v_subtotal, v_discount_amount, v_total_amount
    FROM orders WHERE id = p_order_id;
    
    -- Calculate tax (12% VAT)
    SET v_tax_amount = (v_subtotal * 12) / 100;
    
    -- Insert receipt
    INSERT INTO receipts (
        receipt_number, order_id, customer_name, subtotal, 
        discount_amount, tax_amount, total_amount
    ) VALUES (
        v_receipt_number, p_order_id, v_customer_name, v_subtotal,
        v_discount_amount, v_tax_amount, v_total_amount
    );
    
    SET p_receipt_id = LAST_INSERT_ID();
    
    COMMIT;
END //
DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update order totals when order items are added
DELIMITER //
CREATE TRIGGER update_order_total_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0) 
        FROM order_items 
        WHERE order_id = NEW.order_id
    ),
    total_amount = subtotal - discount_amount
    WHERE id = NEW.order_id;
END //
DELIMITER ;

-- Trigger to update order totals when order items are updated
DELIMITER //
CREATE TRIGGER update_order_total_after_update
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0) 
        FROM order_items 
        WHERE order_id = NEW.order_id
    ),
    total_amount = subtotal - discount_amount
    WHERE id = NEW.order_id;
END //
DELIMITER ;

-- Trigger to update order totals when order items are deleted
DELIMITER //
CREATE TRIGGER update_order_total_after_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
    UPDATE orders 
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0) 
        FROM order_items 
        WHERE order_id = OLD.order_id
    ),
    total_amount = subtotal - discount_amount
    WHERE id = OLD.order_id;
END //
DELIMITER ;

-- Trigger to log activity
DELIMITER //
CREATE TRIGGER log_order_activity
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, user_type, action, table_name, record_id, new_values)
    VALUES (NEW.created_by, 'admin', 'CREATE', 'orders', NEW.id, JSON_OBJECT(
        'order_code', NEW.order_code,
        'customer_name', NEW.customer_name,
        'total_amount', NEW.total_amount,
        'status', NEW.status
    ));
END //
DELIMITER ;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate order total with tax
DELIMITER //
CREATE FUNCTION CalculateOrderTotal(p_order_id INT) 
RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_discount_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_tax_rate DECIMAL(5,2) DEFAULT 12.00; -- 12% VAT
    DECLARE v_total DECIMAL(10,2);
    
    -- Get subtotal from order items
    SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
    FROM order_items WHERE order_id = p_order_id;
    
    -- Get discount amount
    SELECT COALESCE(SUM(discount_amount), 0) INTO v_discount_amount
    FROM order_discounts WHERE order_id = p_order_id;
    
    -- Calculate total with tax
    SET v_total = (v_subtotal - v_discount_amount) * (1 + v_tax_rate/100);
    
    RETURN v_total;
END //
DELIMITER ;

-- Function to format elapsed time
DELIMITER //
CREATE FUNCTION FormatElapsedTime(p_seconds INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_hours INT;
    DECLARE v_minutes INT;
    DECLARE v_remaining_seconds INT;
    
    SET v_hours = FLOOR(p_seconds / 3600);
    SET v_minutes = FLOOR((p_seconds % 3600) / 60);
    SET v_remaining_seconds = p_seconds % 60;
    
    RETURN CONCAT(
        LPAD(v_hours, 2, '0'), ':',
        LPAD(v_minutes, 2, '0'), ':',
        LPAD(v_remaining_seconds, 2, '0')
    );
END //
DELIMITER ;
