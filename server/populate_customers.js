const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateCustomers() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'siszum_pos'
    });

    console.log('Connected to database');

    // Sample customers data
    const customersData = [
      ['CUST0001', 'Maria', 'Santos', 'maria.santos@email.com', '09171234567', '1990-03-15', '123 Rizal Street, Poblacion', 'Manila', 'Philippines', true],
      ['CUST0002', 'Juan', 'Dela Cruz', 'juan.delacruz@email.com', '09281234567', '1985-07-22', '456 Bonifacio Avenue, District 1', 'Quezon City', 'Philippines', true],
      ['CUST0003', 'Ana', 'Garcia', 'ana.garcia@email.com', '09391234567', '1992-11-08', '789 Mabini Street, Centro', 'Makati', 'Philippines', true],
      ['CUST0004', 'Pedro', 'Rodriguez', 'pedro.rodriguez@email.com', '09401234567', '1988-05-30', '321 Luna Street, Barangay 5', 'Pasig', 'Philippines', true],
      ['CUST0005', 'Carmen', 'Lopez', 'carmen.lopez@email.com', '09511234567', '1995-09-14', '654 Aguinaldo Highway, Subdivision', 'Cavite', 'Philippines', true],
      ['CUST0006', 'Roberto', 'Mendoza', 'roberto.mendoza@email.com', '09621234567', '1987-12-03', '987 MacArthur Highway, Block 12', 'Pampanga', 'Philippines', true],
      ['CUST0007', 'Rosa', 'Fernandez', 'rosa.fernandez@email.com', '09731234567', '1993-04-18', '147 Katipunan Avenue, Unit 3B', 'Taguig', 'Philippines', true],
      ['CUST0008', 'Miguel', 'Torres', 'miguel.torres@email.com', '09841234567', '1991-08-27', '258 EDSA Extension, Phase 2', 'Muntinlupa', 'Philippines', true],
      ['CUST0009', 'Elena', 'Ramos', 'elena.ramos@email.com', '09951234567', '1994-01-12', '369 Commonwealth Avenue, Block 8', 'Marikina', 'Philippines', true],
      ['CUST0010', 'Jose', 'Morales', 'jose.morales@email.com', '09061234567', '1989-06-25', '741 Ortigas Center, Tower 1', 'Mandaluyong', 'Philippines', true],
      ['CUST0011', 'Luz', 'Jimenez', 'luz.jimenez@email.com', '09171234568', '1996-10-09', '852 Greenhills, East Wing', 'San Juan', 'Philippines', true],
      ['CUST0012', 'Carlos', 'Herrera', 'carlos.herrera@email.com', '09281234568', '1986-02-14', '963 Shaw Boulevard, Metro East', 'Pasig', 'Philippines', true],
      ['CUST0013', 'Sofia', 'Aguilar', 'sofia.aguilar@email.com', '09391234568', '1997-07-31', '159 Alabang Hills, Village 3', 'Las Piñas', 'Philippines', false],
      ['CUST0014', 'Diego', 'Castillo', 'diego.castillo@email.com', '09401234568', '1984-11-16', '357 Eastwood City, Cyber Park', 'Quezon City', 'Philippines', true],
      ['CUST0015', 'Isabella', 'Vargas', 'isabella.vargas@email.com', '09511234568', '1998-04-03', '486 BGC Central, High Street', 'Taguig', 'Philippines', true],
      ['CUST0016', 'Fernando', 'Ruiz', 'fernando.ruiz@email.com', '09621234568', '1983-08-20', '724 Ayala Avenue, Makati CBD', 'Makati', 'Philippines', true],
      ['CUST0017', 'Gabriela', 'Ortega', 'gabriela.ortega@email.com', '09731234568', '1999-12-07', '135 SM Mall of Asia, Seaside', 'Pasay', 'Philippines', true],
      ['CUST0018', 'Ricardo', 'Gutierrez', 'ricardo.gutierrez@email.com', '09841234568', '1982-03-24', '246 Rockwell Center, Power Plant', 'Makati', 'Philippines', true],
      ['CUST0019', 'Valentina', 'Peña', 'valentina.pena@email.com', '09951234568', '1993-09-11', '579 Trinoma Mall, North Avenue', 'Quezon City', 'Philippines', false],
      ['CUST0020', 'Antonio', 'Rivera', 'antonio.rivera@email.com', '09061234568', '1990-01-28', '681 Megamall, EDSA Corner', 'Mandaluyong', 'Philippines', true],
      ['CUST0021', 'Mariana', 'Cruz', 'mariana.cruz@email.com', '09171234569', null, null, 'Cebu City', 'Philippines', true],
      ['CUST0022', 'Francisco', 'Reyes', 'francisco.reyes@email.com', '09281234569', null, null, 'Davao City', 'Philippines', true],
      ['CUST0023', 'Camila', 'Flores', 'camila.flores@email.com', '09391234569', null, null, 'Iloilo City', 'Philippines', true],
      ['CUST0024', 'Eduardo', 'Moreno', 'eduardo.moreno@email.com', '09401234569', null, null, 'Cagayan de Oro', 'Philippines', true],
      ['CUST0025', 'Patricia', 'Romero', 'patricia.romero@email.com', '09511234569', null, null, 'Bacolod City', 'Philippines', true],
      ['CUST0026', 'Alejandro', 'Delgado', 'alejandro.delgado@email.com', '09621234569', null, null, 'Zamboanga City', 'Philippines', false],
      ['CUST0027', 'Natalia', 'Castro', 'natalia.castro@email.com', '09731234569', null, null, 'Baguio City', 'Philippines', true],
      ['CUST0028', 'Sebastian', 'Medina', 'sebastian.medina@email.com', '09841234569', null, null, 'Tacloban City', 'Philippines', true],
      ['CUST0029', 'Daniela', 'Sandoval', 'daniela.sandoval@email.com', '09951234569', null, null, 'Dumaguete City', 'Philippines', true],
      ['CUST0030', 'Mateo', 'Guerrero', 'mateo.guerrero@email.com', '09061234569', null, null, 'General Santos', 'Philippines', true]
    ];

    // Insert customers
    const insertQuery = `
      INSERT IGNORE INTO customers 
      (customer_code, first_name, last_name, email, phone, date_of_birth, address, city, country, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const customer of customersData) {
      await connection.execute(insertQuery, customer);
    }

    console.log(`Successfully inserted ${customersData.length} customers`);

    // Get count
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM customers');
    console.log(`Total customers in database: ${rows[0].count}`);

    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error populating customers:', error);
  }
}

populateCustomers();
