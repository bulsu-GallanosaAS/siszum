import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all orders with pagination and filtering
router.get('/', async (req, res) => {
  try {
    console.log('Orders API called with params:', req.query);
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    
    console.log('Parsed params:', { page, limit, search, status });
    
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams: any[] = [];
 
    // Add search conditions
    if (search) {
      whereConditions.push(`(o.order_code LIKE ? OR o.customer_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Add status filter
    if (status !== 'all') {
      whereConditions.push(`o.status = ?`);
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
    `;
    
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Get orders with pagination
     
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_code,
        o.customer_id,
        o.customer_name,
        o.order_type,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.total_amount,
        o.status,
        o.payment_status,
        o.order_date,
        o.order_time,
        o.completed_at,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count,
        rt.table_number as table_no,
        rt.table_code,
        SUM(oi.quantity) as quantity
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    queryParams.push(limit, offset);
    const [ordersResult] = await pool.execute<RowDataPacket[]>(ordersQuery, queryParams);
    
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: ordersResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get orders statistics
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('Stats API called');
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_orders,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURDATE() AND status = 'completed' THEN total_amount ELSE 0 END), 0) as today_revenue
      FROM orders
    `;
    
    const [statsResult] = await pool.execute<RowDataPacket[]>(statsQuery);
    
    res.json({
      success: true,
      message: 'Orders statistics retrieved successfully',
      data: statsResult[0]
    });

  } catch (error) {
    console.error('Error fetching orders statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_id,
      table_id,
      order_type,
      items,
      subtotal,
      service_charge,
      additional_fees,
      discount,
      total_amount,
      payment_method,
      status = 'pending'
    } = req.body;

    console.log('Creating order with data:', req.body);

    if (!customer_name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer_name and items are required'
      });
    }

    // Generate order code
    const orderCodeQuery = 'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()';
    const [codeResult] = await pool.execute<RowDataPacket[]>(orderCodeQuery);
    const dailyCount = codeResult[0].count;
    const orderCode = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(dailyCount + 1).padStart(3, '0')}`;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert order
      const orderQuery = `
        INSERT INTO orders (
          order_code, customer_id, customer_name, table_id, order_type,
          subtotal, discount_amount, tax_amount, total_amount, status,
          payment_status, order_date, order_time, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?)
      `;

      const tax_amount = service_charge || 0;
      const discount_amount = discount || 0;
      const payment_status = status === 'completed' ? 'paid' : 'pending';

      const [orderResult] = await connection.execute(orderQuery, [
        orderCode,
        customer_id || null,
        customer_name,
        table_id || null,
        order_type || 'dine_in',
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        status,
        payment_status,
        1 // created_by (assuming admin user ID is 1)
      ]);

      const orderId = (orderResult as any).insertId;

      // Insert order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.execute(itemQuery, [
          orderId,
          item.item_id,
          item.quantity,
          item.unit_price,
          item.total_price
        ]);

        // Update inventory for non-unlimited items
        if (!item.is_unlimited) {
          const updateInventoryQuery = `
            UPDATE menu_items 
            SET quantity_in_stock = quantity_in_stock - ? 
            WHERE id = ? AND quantity_in_stock >= ?
          `;
          
          await connection.execute(updateInventoryQuery, [
            item.quantity,
            item.item_id,
            item.quantity
          ]);
        }
      }

      // If payment is completed, create transaction record
      if (status === 'completed' && payment_method) {
        const transactionCode = `TXN${orderCode.slice(3)}`;
        const transactionQuery = `
          INSERT INTO transactions (
            transaction_code, order_id, customer_id, payment_method,
            amount, status, reference_number, payment_date, payment_time, processed_by
          ) VALUES (?, ?, ?, ?, ?, 'completed', ?, CURDATE(), CURTIME(), ?)
        `;

        await connection.execute(transactionQuery, [
          transactionCode,
          orderId,
          customer_id || null,
          payment_method,
          total_amount,
          `${payment_method.toUpperCase()}${String(Date.now()).slice(-6)}`,
          1 // processed_by
        ]);

        // Create receipt
        const receiptNumber = `RCP${orderCode.slice(3)}`;
        const receiptQuery = `
          INSERT INTO receipts (
            receipt_number, order_id, transaction_id, customer_name,
            subtotal, discount_amount, tax_amount, total_amount
          ) VALUES (?, ?, LAST_INSERT_ID(), ?, ?, ?, ?, ?)
        `;

        await connection.execute(receiptQuery, [
          receiptNumber,
          orderId,
          customer_name,
          subtotal,
          discount_amount,
          tax_amount,
          total_amount
        ]);
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: orderId,
          order_code: orderCode,
          status: status
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get orders by customer ID
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const query = `
      SELECT 
        o.id,
        o.order_code,
        o.customer_id,
        o.customer_name,
        o.order_type,
        o.subtotal,
        o.discount_amount,
        o.tax_amount,
        o.total_amount,
        o.status,
        o.payment_status,
        o.order_date,
        o.order_time,
        o.completed_at,
        o.notes,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [customerId]);

    res.json({
      success: true,
      message: 'Customer orders retrieved successfully',
      data: rows
    });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Update order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const {
      status,
      payment_status,
      payment_method,
      notes
    } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];

    if (status) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }

    if (payment_status) {
      updateFields.push('payment_status = ?');
      queryParams.push(payment_status);
    }

    if (notes !== undefined) {
      updateFields.push('notes = ?');
      queryParams.push(notes);
    }

    if (status === 'completed') {
      updateFields.push('completed_at = NOW()');
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `;

    queryParams.push(orderId);

    await pool.execute(updateQuery, queryParams);

    // If payment is being processed, create transaction record
    if (payment_status === 'paid' && payment_method) {
      // Get order details first
      const [orderResult] = await pool.execute<RowDataPacket[]>(
        'SELECT order_code, customer_id, total_amount FROM orders WHERE id = ?',
        [orderId]
      );

      if (orderResult.length > 0) {
        const order = orderResult[0];
        const transactionCode = `TXN${order.order_code.slice(3)}`;
        
        const transactionQuery = `
          INSERT INTO transactions (
            transaction_code, order_id, customer_id, payment_method,
            amount, status, reference_number, payment_date, payment_time, processed_by
          ) VALUES (?, ?, ?, ?, ?, 'completed', ?, CURDATE(), CURTIME(), ?)
        `;

        await pool.execute(transactionQuery, [
          transactionCode,
          orderId,
          order.customer_id,
          payment_method,
          order.total_amount,
          `${payment_method.toUpperCase()}${String(Date.now()).slice(-6)}`,
          1 // processed_by (assuming admin user ID is 1)
        ]);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
