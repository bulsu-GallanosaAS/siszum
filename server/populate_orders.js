const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateOrders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'siszum_pos'
  });

  try {
    console.log('Connected to database...');

    // Get some customer IDs first
    const [customers] = await connection.execute('SELECT id FROM customers LIMIT 10');
    
    if (customers.length === 0) {
      console.log('No customers found. Please populate customers first.');
      return;
    }

    console.log(`Found ${customers.length} customers. Creating sample orders...`);

    // Create sample orders
    const orders = [];
    const orderStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'partial'];
    const orderTypes = ['dine_in', 'takeout', 'delivery'];

    for (let i = 0; i < 30; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      
      // Random date within last 3 months
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 90));
      
      const orderDate = randomDate.toISOString().split('T')[0];
      const orderTime = `${Math.floor(Math.random() * 12) + 8}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`;
      
      const subtotal = Math.random() * 500 + 50; // Between 50 and 550
      const discountAmount = subtotal * (Math.random() * 0.1); // Up to 10% discount
      const taxAmount = (subtotal - discountAmount) * 0.12; // 12% tax
      const totalAmount = subtotal - discountAmount + taxAmount;

      orders.push([
        `ORD${(1000 + i).toString()}`,
        customer.id,
        `Customer ${customer.id}`,
        null, // table_id
        orderType,
        subtotal.toFixed(2),
        discountAmount.toFixed(2),
        taxAmount.toFixed(2),
        totalAmount.toFixed(2),
        status,
        paymentStatus,
        orderDate,
        orderTime,
        status === 'completed' ? new Date(randomDate.getTime() + Math.random() * 3600000) : null, // completed_at
        Math.random() > 0.7 ? 'Special instructions for this order' : null,
        1 // created_by (admin id)
      ]);
    }

    const insertQuery = `
      INSERT INTO orders (
        order_code, customer_id, customer_name, table_id, order_type, 
        subtotal, discount_amount, tax_amount, total_amount, status, 
        payment_status, order_date, order_time, completed_at, notes, created_by
      ) VALUES ?
    `;

    await connection.query(insertQuery, [orders]);

    console.log(`✅ Successfully inserted ${orders.length} sample orders!`);

    // Now let's add some order items for each order
    console.log('Adding order items...');

    // Get all orders and some menu items
    const [orderRows] = await connection.execute('SELECT id FROM orders');
    const [menuItems] = await connection.execute('SELECT id, selling_price FROM menu_items LIMIT 20');

    if (menuItems.length === 0) {
      console.log('No menu items found. Skipping order items creation.');
    } else {
      const orderItems = [];
      
      for (const order of orderRows) {
        // Each order gets 1-5 items
        const itemCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < itemCount; j++) {
          const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = menuItem.selling_price;
          const totalPrice = unitPrice * quantity;

          orderItems.push([
            order.id,
            menuItem.id,
            quantity,
            unitPrice,
            totalPrice,
            Math.random() > 0.8 ? 'Extra spicy' : null // special_instructions
          ]);
        }
      }

      const itemsInsertQuery = `
        INSERT INTO order_items (
          order_id, menu_item_id, quantity, unit_price, total_price, special_instructions
        ) VALUES ?
      `;

      await connection.query(itemsInsertQuery, [orderItems]);
      console.log(`✅ Successfully inserted ${orderItems.length} order items!`);
    }

    console.log('✅ Sample orders population completed!');

  } catch (error) {
    console.error('Error populating orders:', error);
  } finally {
    await connection.end();
  }
}

populateOrders();
