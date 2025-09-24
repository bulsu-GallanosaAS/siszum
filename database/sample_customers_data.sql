-- Insert sample customer data
-- This will populate the customers table with realistic test data

INSERT IGNORE INTO customers (id, customer_code, first_name, last_name, email, phone, date_of_birth, address, city, country, is_active) VALUES
(1, 'CUST0001', 'Maria', 'Santos', 'maria.santos@email.com', '09171234567', '1990-03-15', '123 Rizal Street, Poblacion', 'Manila', 'Philippines', TRUE),
(2, 'CUST0002', 'Juan', 'Dela Cruz', 'juan.delacruz@email.com', '09281234567', '1985-07-22', '456 Bonifacio Avenue, District 1', 'Quezon City', 'Philippines', TRUE),
(3, 'CUST0003', 'Ana', 'Garcia', 'ana.garcia@email.com', '09391234567', '1992-11-08', '789 Mabini Street, Centro', 'Makati', 'Philippines', TRUE),
(4, 'CUST0004', 'Pedro', 'Rodriguez', 'pedro.rodriguez@email.com', '09401234567', '1988-05-30', '321 Luna Street, Barangay 5', 'Pasig', 'Philippines', TRUE),
(5, 'CUST0005', 'Carmen', 'Lopez', 'carmen.lopez@email.com', '09511234567', '1995-09-14', '654 Aguinaldo Highway, Subdivision', 'Cavite', 'Philippines', TRUE),
(6, 'CUST0006', 'Roberto', 'Mendoza', 'roberto.mendoza@email.com', '09621234567', '1987-12-03', '987 MacArthur Highway, Block 12', 'Pampanga', 'Philippines', TRUE),
(7, 'CUST0007', 'Rosa', 'Fernandez', 'rosa.fernandez@email.com', '09731234567', '1993-04-18', '147 Katipunan Avenue, Unit 3B', 'Taguig', 'Philippines', TRUE),
(8, 'CUST0008', 'Miguel', 'Torres', 'miguel.torres@email.com', '09841234567', '1991-08-27', '258 EDSA Extension, Phase 2', 'Muntinlupa', 'Philippines', TRUE),
(9, 'CUST0009', 'Elena', 'Ramos', 'elena.ramos@email.com', '09951234567', '1994-01-12', '369 Commonwealth Avenue, Block 8', 'Marikina', 'Philippines', TRUE),
(10, 'CUST0010', 'Jose', 'Morales', 'jose.morales@email.com', '09061234567', '1989-06-25', '741 Ortigas Center, Tower 1', 'Mandaluyong', 'Philippines', TRUE),
(11, 'CUST0011', 'Luz', 'Jimenez', 'luz.jimenez@email.com', '09171234568', '1996-10-09', '852 Greenhills, East Wing', 'San Juan', 'Philippines', TRUE),
(12, 'CUST0012', 'Carlos', 'Herrera', 'carlos.herrera@email.com', '09281234568', '1986-02-14', '963 Shaw Boulevard, Metro East', 'Pasig', 'Philippines', TRUE),
(13, 'CUST0013', 'Sofia', 'Aguilar', 'sofia.aguilar@email.com', '09391234568', '1997-07-31', '159 Alabang Hills, Village 3', 'Las Piñas', 'Philippines', FALSE),
(14, 'CUST0014', 'Diego', 'Castillo', 'diego.castillo@email.com', '09401234568', '1984-11-16', '357 Eastwood City, Cyber Park', 'Quezon City', 'Philippines', TRUE),
(15, 'CUST0015', 'Isabella', 'Vargas', 'isabella.vargas@email.com', '09511234568', '1998-04-03', '486 BGC Central, High Street', 'Taguig', 'Philippines', TRUE),
(16, 'CUST0016', 'Fernando', 'Ruiz', 'fernando.ruiz@email.com', '09621234568', '1983-08-20', '724 Ayala Avenue, Makati CBD', 'Makati', 'Philippines', TRUE),
(17, 'CUST0017', 'Gabriela', 'Ortega', 'gabriela.ortega@email.com', '09731234568', '1999-12-07', '135 SM Mall of Asia, Seaside', 'Pasay', 'Philippines', TRUE),
(18, 'CUST0018', 'Ricardo', 'Gutierrez', 'ricardo.gutierrez@email.com', '09841234568', '1982-03-24', '246 Rockwell Center, Power Plant', 'Makati', 'Philippines', TRUE),
(19, 'CUST0019', 'Valentina', 'Peña', 'valentina.pena@email.com', '09951234568', '1993-09-11', '579 Trinoma Mall, North Avenue', 'Quezon City', 'Philippines', FALSE),
(20, 'CUST0020', 'Antonio', 'Rivera', 'antonio.rivera@email.com', '09061234568', '1990-01-28', '681 Megamall, EDSA Corner', 'Mandaluyong', 'Philippines', TRUE);

-- Add more sample customers to test pagination
INSERT IGNORE INTO customers (customer_code, first_name, last_name, email, phone, city, country, is_active) VALUES
('CUST0021', 'Mariana', 'Cruz', 'mariana.cruz@email.com', '09171234569', 'Cebu City', 'Philippines', TRUE),
('CUST0022', 'Francisco', 'Reyes', 'francisco.reyes@email.com', '09281234569', 'Davao City', 'Philippines', TRUE),
('CUST0023', 'Camila', 'Flores', 'camila.flores@email.com', '09391234569', 'Iloilo City', 'Philippines', TRUE),
('CUST0024', 'Eduardo', 'Moreno', 'eduardo.moreno@email.com', '09401234569', 'Cagayan de Oro', 'Philippines', TRUE),
('CUST0025', 'Patricia', 'Romero', 'patricia.romero@email.com', '09511234569', 'Bacolod City', 'Philippines', TRUE),
('CUST0026', 'Alejandro', 'Delgado', 'alejandro.delgado@email.com', '09621234569', 'Zamboanga City', 'Philippines', FALSE),
('CUST0027', 'Natalia', 'Castro', 'natalia.castro@email.com', '09731234569', 'Baguio City', 'Philippines', TRUE),
('CUST0028', 'Sebastian', 'Medina', 'sebastian.medina@email.com', '09841234569', 'Tacloban City', 'Philippines', TRUE),
('CUST0029', 'Daniela', 'Sandoval', 'daniela.sandoval@email.com', '09951234569', 'Dumaguete City', 'Philippines', TRUE),
('CUST0030', 'Mateo', 'Guerrero', 'mateo.guerrero@email.com', '09061234569', 'General Santos', 'Philippines', TRUE);
