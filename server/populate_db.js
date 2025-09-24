const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateDatabase() {
  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'siszum_pos'
    });

    console.log('Connected to database');

    // Check if menu_categories table exists and has data
    const [categories] = await connection.execute('SELECT COUNT(*) as count FROM menu_categories');
    console.log('Categories count:', categories[0].count);

    if (categories[0].count === 0) {
      console.log('Inserting categories...');
      await connection.execute(`
        INSERT INTO menu_categories (id, name, description, sort_order) VALUES
        (1, 'Unlimited Menu', 'All-you-can-eat options', 1),
        (2, 'Ala Carte Menu', 'Individual menu items', 2),
        (3, 'Side Dishes', 'Complementary dishes', 3),
        (4, 'Add Ons', 'Additional items and extras', 4)
      `);
    }

    // Check if menu_items table has data
    const [items] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    console.log('Menu items count:', items[0].count);

    if (items[0].count === 0) {
      console.log('Inserting menu items...');
      
      const menuItems = [
        ['SET-A', 'SET A UNLI PORK', 1, 299.00, 250.00, 999, 'set', 'available', true, false],
        ['SET-B', 'SET B UNLI PORK & CHICKEN', 1, 349.00, 300.00, 999, 'set', 'available', true, false],
        ['SET-C', 'SET C UNLI PREMIUM PORK', 1, 399.00, 350.00, 999, 'set', 'available', true, true],
        ['SET-D', 'SET D UNLI PORK/CHICKEN & CHICKEN', 1, 449.00, 400.00, 999, 'set', 'available', true, true],
        ['SAMG-PORK', 'SAMG PORK ON CUP', 2, 89.00, 70.00, 45, 'cup', 'available', false, false],
        ['SAMG-CHICKEN', 'SAMG CHICKEN ON CUP', 2, 89.00, 70.00, 32, 'cup', 'available', false, false],
        ['SAMG-BEEF', 'SAMG BEEF ON CUP', 2, 99.00, 80.00, 28, 'cup', 'available', false, false],
        ['CHICKEN-POP', 'CHICKEN POPPERS ON CUP', 2, 79.00, 60.00, 15, 'cup', 'available', false, false],
        ['KOREAN-MEET', 'KOREAN MEET ON CUP', 2, 89.00, 70.00, 8, 'cup', 'available', false, false],
        ['CHEESE', 'CHEESE', 2, 45.00, 35.00, 0, 'piece', 'out_of_stock', false, false],
        ['FISHCAKE', 'FISHCAKE ON TUB', 3, 65.00, 50.00, 22, 'tub', 'available', false, false],
        ['EGGROLL', 'EGGROLL ON TUB', 3, 55.00, 40.00, 18, 'tub', 'available', false, false],
        ['BABY-POTATO', 'BABY POTATOES ON TUB', 3, 60.00, 45.00, 25, 'tub', 'available', false, false],
        ['KIMCHI', 'KIMCHI ON TUB', 3, 50.00, 35.00, 12, 'tub', 'available', false, false],
        ['UNLI-CHEESE', 'UNLI CHEESE', 4, 75.00, 60.00, 35, 'serving', 'available', false, false],
        ['RICE-PLAIN', 'Plain Rice', 3, 25.00, 15.00, 85, 'cup', 'available', false, false],
        ['RICE-GARLIC', 'Garlic Rice', 3, 35.00, 25.00, 65, 'cup', 'available', false, false],
        ['SAUCE-SOY', 'Soy Sauce', 4, 10.00, 5.00, 150, 'packet', 'available', false, false],
        ['SAUCE-CHILI', 'Chili Sauce', 4, 15.00, 8.00, 120, 'packet', 'available', false, false],
        ['DRINK-SODA', 'Softdrinks', 4, 45.00, 30.00, 48, 'bottle', 'available', false, false],
        ['DRINK-JUICE', 'Fresh Juice', 4, 65.00, 40.00, 25, 'glass', 'available', false, false],
        ['DESSERT-ICE', 'Ice Cream', 4, 55.00, 35.00, 18, 'scoop', 'available', false, false]
      ];

      for (const item of menuItems) {
        await connection.execute(`
          INSERT INTO menu_items (
            product_code, name, category_id, selling_price, purchase_price,
            quantity_in_stock, unit_type, availability, is_unlimited, is_premium
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, item);
      }
    }

    // Verify data was inserted
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    console.log('Final menu items count:', finalCount[0].count);

    // Show some sample data
    const [sampleItems] = await connection.execute(`
      SELECT mi.name, mi.selling_price, mi.quantity_in_stock, mc.name as category
      FROM menu_items mi 
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id 
      LIMIT 5
    `);
    console.log('Sample items:', sampleItems);

    console.log('Database populated successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateDatabase();
