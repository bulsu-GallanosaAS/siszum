import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { executeQuery } from '../config/database';

const router = express.Router();

// Get all refill requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      table_code
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = [];
    let queryParams: any[] = [];

    // Build WHERE conditions
    if (status) {
      whereConditions.push('rr.status = ?');
      queryParams.push(status);
    }

    if (table_code) {
      whereConditions.push('rr.table_code LIKE ?');
      queryParams.push(`%${table_code}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get refill requests with table and customer details
    const refillsQuery = `
      SELECT 
        rr.id,
        rr.table_code,
        rr.table_id,
        rr.customer_id,
        rr.status,
        rr.request_type,
        rr.price,
        rr.requested_at,
        rr.processed_by,
        rr.completed_at,
        rt.table_number,
        CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, '')) as customer_name,
        TIMESTAMPDIFF(MINUTE, rr.requested_at, NOW()) as elapsed_minutes
      FROM refill_requests rr
      LEFT JOIN restaurant_tables rt ON rr.table_id = rt.id
      LEFT JOIN customers c ON rr.customer_id = c.id
      ${whereClause}
      ORDER BY rr.requested_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    queryParams.push(Number(limit), offset);
    const refills = await executeQuery(refillsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM refill_requests rr
      ${whereClause}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const [{ total }] = await executeQuery(countQuery, countParams);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'on-going' THEN 1 END) as ongoing_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests
      FROM refill_requests
    `;
    const [stats] = await executeQuery(statsQuery);

    res.json({
      success: true,
      data: {
        refills,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching refill requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refill requests',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update refill request status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.id || 1;

  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateQuery = `
      UPDATE refill_requests 
      SET status = ?, 
          processed_by = ?,
          completed_at = CASE WHEN ? != 'pending' THEN NOW() ELSE NULL END
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [status, userId, status, id]);

    res.json({
      success: true,
      message: 'Refill request status updated successfully'
    });

  } catch (error) {
    console.error('Error updating refill request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update refill request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new refill request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      table_code,
      table_id,
      customer_id,
      request_type,
      price = 200.00
    } = req.body;

    if (!table_code || !table_id || !request_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const insertQuery = `
      INSERT INTO refill_requests (table_code, table_id, customer_id, request_type, price, status, requested_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const result = await executeQuery(insertQuery, [table_code, table_id, customer_id, request_type, price]);

    res.json({
      success: true,
      message: 'Refill request created successfully',
      data: { id: (result as any).insertId }
    });

  } catch (error) {
    console.error('Error creating refill request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create refill request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
