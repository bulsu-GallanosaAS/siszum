-- SISZUM POS Database Schema
-- Enhanced schema for Admin Side and Client Side features

-- ============================================
-- USER MANAGEMENT TABLES
-- ============================================

-- Admin users table
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    city VARCHAR(50),
    country VARCHAR(50),
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customer accounts table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- RESTAURANT MANAGEMENT TABLES
-- ============================================

-- Restaurant tables
CREATE TABLE restaurant_tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    table_code VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    status ENUM('available', 'occupied', 'reserved', 'maintenance') DEFAULT 'available',
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- MENU MANAGEMENT TABLES
-- ============================================

-- Menu categories
CREATE TABLE menu_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menu items/products
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INT,
    selling_price DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2),
    purchase_value DECIMAL(10,2),
    quantity_in_stock INT DEFAULT 0,
    unit_type VARCHAR(20) DEFAULT 'piece',
    availability ENUM('available', 'out_of_stock', 'discontinued') DEFAULT 'available',
    image_url VARCHAR(255),
    is_unlimited BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL
);

-- ============================================
-- DISCOUNT MANAGEMENT TABLES
-- ============================================

-- Discount types
CREATE TABLE discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- RESERVATION MANAGEMENT TABLES
-- ============================================

-- Reservations
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    table_id INT,
    occasion VARCHAR(100),
    number_of_guests INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    duration_hours INT DEFAULT 2,
    payment_amount DECIMAL(10,2) DEFAULT 0,
    payment_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    reservation_fee_amount DECIMAL(10,2) DEFAULT 0,
    confirmed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL
);

-- ============================================
-- ORDER MANAGEMENT TABLES
-- ============================================

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT,
    customer_name VARCHAR(100),
    table_id INT,
    order_type ENUM('dine_in', 'takeout', 'delivery') DEFAULT 'dine_in',
    subtotal DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
    order_date DATE NOT NULL,
    order_time TIME NOT NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- Order items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

-- Applied discounts to orders
CREATE TABLE order_discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    discount_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE RESTRICT
);

-- ============================================
-- PAYMENT & TRANSACTION TABLES
-- ============================================

-- Transactions/Payments
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(20) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    customer_id INT,
    payment_method ENUM('cash', 'card', 'gcash', 'bank_transfer') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference_number VARCHAR(100),
    payment_date DATE NOT NULL,
    payment_time TIME NOT NULL,
    processed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================
-- RECEIPT MANAGEMENT TABLES
-- ============================================

-- Receipts
CREATE TABLE receipts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_number VARCHAR(20) UNIQUE NOT NULL,
    order_id INT NOT NULL,
    transaction_id INT,
    customer_name VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    printed_at TIMESTAMP NULL,
    email_sent_at TIMESTAMP NULL,
    is_voided BOOLEAN DEFAULT FALSE,
    void_reason TEXT,
    voided_at TIMESTAMP NULL,
    voided_by INT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (voided_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================
-- CUSTOMER TIMER MANAGEMENT
-- ============================================

-- Customer timers (for tracking dining time)
CREATE TABLE customer_timers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    table_id INT NOT NULL,
    order_id INT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    elapsed_seconds INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================
-- REFILL MANAGEMENT TABLES
-- ============================================

-- Refill requests
CREATE TABLE refill_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_code VARCHAR(20) NOT NULL,
    table_id INT NOT NULL,
    customer_id INT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    request_type VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    processed_by INT,
    notes TEXT,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================
-- FEEDBACK MANAGEMENT TABLES
-- ============================================

-- Customer feedback
CREATE TABLE customer_feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    feedback_type ENUM('compliment', 'complaint', 'suggestion', 'general') DEFAULT 'general',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT NOT NULL,
    order_id INT,
    status ENUM('pending', 'reviewed', 'responded', 'resolved') DEFAULT 'pending',
    admin_response TEXT,
    responded_by INT,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================
-- SYSTEM ACTIVITY LOGS
-- ============================================

-- Activity logs for auditing
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    user_type ENUM('admin', 'customer') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Customer indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_active ON customers(is_active);

-- Order indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_code ON orders(order_code);

-- Transaction indexes
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(payment_date);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Reservation indexes
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_table ON reservations(table_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Menu item indexes
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_availability ON menu_items(availability);
CREATE INDEX idx_menu_items_code ON menu_items(product_code);

-- Timer indexes
CREATE INDEX idx_timers_table ON customer_timers(table_id);
CREATE INDEX idx_timers_active ON customer_timers(is_active);
CREATE INDEX idx_timers_start ON customer_timers(start_time);

-- ============================================
-- INITIAL DATA INSERTION
-- ============================================

-- Insert default menu categories
INSERT INTO menu_categories (name, description, sort_order) VALUES
('Unlimited Menu', 'All-you-can-eat options', 1),
('Ala Carte Menu', 'Individual menu items', 2),
('Side Dishes', 'Complementary dishes', 3),
('Add Ons', 'Additional items and extras', 4);

-- Insert default discounts
INSERT INTO discounts (name, code, type, value, description) VALUES
('Senior Citizen Discount', 'SENIOR', 'percentage', 20.00, '20% discount for senior citizens'),
('PWD Discount', 'PWD', 'percentage', 20.00, '20% discount for persons with disability'),
('Left Overs Fee', 'LEFTOVER', 'fixed_amount', 25.00, 'Fee for leftover food');

-- Insert sample restaurant tables
INSERT INTO restaurant_tables (table_number, table_code, capacity) VALUES
('1', 'TBL001', 4),
('2', 'TBL002', 4),
('3', 'TBL003', 6),
('4', 'TBL004', 4),
('5', 'TBL005', 2),
('6', 'TBL006', 4),
('7', 'TBL007', 8),
('8', 'TBL008', 4);

-- Insert sample menu items
INSERT INTO menu_items (product_code, name, category_id, selling_price, availability, is_unlimited) VALUES
('SET-A', 'SET A UNLI PORK', 1, 299.00, 'available', TRUE),
('SET-B', 'SET B UNLI PORK & CHICKEN', 1, 349.00, 'available', TRUE),
('SET-C', 'SET C UNLI PREMIUM PORK', 1, 399.00, 'available', TRUE),
('SET-D', 'SET D UNLI PORK/CHICKEN & CHICKEN', 1, 449.00, 'available', TRUE),
('SAMG-PORK', 'SAMG PORK ON CUP', 2, 89.00, 'available', FALSE),
('SAMG-CHICKEN', 'SAMG CHICKEN ON CUP', 2, 89.00, 'available', FALSE),
('SAMG-BEEF', 'SAMG BEEF ON CUP', 2, 99.00, 'available', FALSE),
('CHICKEN-POP', 'CHICKEN POPPERS ON CUP', 2, 79.00, 'available', FALSE),
('KOREAN-MEET', 'KOREAN MEET ON CUP', 2, 89.00, 'available', FALSE),
('CHEESE', 'CHEESE', 2, 45.00, 'available', FALSE),
('FISHCAKE', 'FISHCAKE ON TUB', 3, 65.00, 'available', FALSE),
('EGGROLL', 'EGGROLL ON TUB', 3, 55.00, 'available', FALSE),
('BABY-POTATO', 'BABY POTATOES ON TUB', 3, 60.00, 'available', FALSE),
('KIMCHI', 'KIMCHI ON TUB', 3, 50.00, 'available', FALSE),
('UNLI-CHEESE', 'UNLI CHEESE', 4, 75.00, 'available', FALSE);

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@siszumpos.com', '$2b$12$1F3Fic5Im2afY/h08p46.eExcDgi6aHgaTtkx/1R9KnRBecZeSWCu', 'System', 'Administrator', 'super_admin');
