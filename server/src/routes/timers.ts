import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { executeQuery } from '../config/database';

const router = express.Router();

// Get all active customer timers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      is_active
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereConditions = ['1=1'];
    let queryParams: any[] = [];

    // Filter by active status
    if (is_active !== undefined) {
      whereConditions.push('ct.is_active = ?');
      queryParams.push(is_active === 'true');
    }

    const whereClause = whereConditions.join(' AND ');

    // Get customer timers with table details
    const timersQuery = `
      SELECT 
        ct.id,
        ct.customer_name,
        ct.table_id,
        ct.order_id,
        ct.start_time,
        ct.end_time,
        ct.elapsed_seconds,
        ct.is_active,
        rt.table_number,
        rt.table_code,
        o.order_code,
        TIMESTAMPDIFF(SECOND, ct.start_time, COALESCE(ct.end_time, NOW())) as current_elapsed_seconds,
        CASE 
          WHEN ct.is_active = 1 AND TIMESTAMPDIFF(SECOND, ct.start_time, NOW()) >= 7200 THEN 'expired'
          WHEN ct.is_active = 1 AND TIMESTAMPDIFF(SECOND, ct.start_time, NOW()) >= 6300 THEN 'warning'
          WHEN ct.is_active = 1 THEN 'active'
          ELSE 'completed'
        END as timer_status
      FROM customer_timers ct
      LEFT JOIN restaurant_tables rt ON ct.table_id = rt.id
      LEFT JOIN orders o ON ct.order_id = o.id
      WHERE ${whereClause}
      ORDER BY ct.start_time DESC
      
    `;

    queryParams.push(Number(limit), offset);
    const timers = await executeQuery(timersQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customer_timers ct
      WHERE ${whereClause}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const [{ total }] = await executeQuery(countQuery, countParams);

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_timers,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_timers,
        COUNT(CASE WHEN is_active = 1 AND TIMESTAMPDIFF(SECOND, start_time, NOW()) >= 7200 THEN 1 END) as expired_timers,
        COUNT(CASE WHEN is_active = 1 AND TIMESTAMPDIFF(SECOND, start_time, NOW()) >= 6300 AND TIMESTAMPDIFF(SECOND, start_time, NOW()) < 7200 THEN 1 END) as warning_timers
      FROM customer_timers
    `;
    const [stats] = await executeQuery(statsQuery);

    res.json({
      success: true,
      data: {
        timers,
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
    console.error('Error fetching customer timers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer timers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new customer timer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      table_id,
      order_id
    } = req.body;

    if (!customer_name || !table_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and table ID are required'
      });
    }

    // Check if table already has an active timer
    const existingTimerQuery = `
      SELECT id FROM customer_timers 
      WHERE table_id = ? AND is_active = 1
    `;
    const existingTimer = await executeQuery(existingTimerQuery, [table_id]);

    if (existingTimer.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Table already has an active timer'
      });
    }

    // Create new timer
    const insertQuery = `
      INSERT INTO customer_timers (customer_name, table_id, order_id, start_time, elapsed_seconds, is_active)
      VALUES (?, ?, ?, NOW(), 0, 1)
    `;

  const result = await executeQuery(insertQuery, [customer_name, table_id, order_id ?? null]);

    // Update table status to occupied
    await executeQuery('UPDATE restaurant_tables SET status = "occupied" WHERE id = ?', [table_id]);

    res.json({
      success: true,
      message: 'Customer timer created successfully',
      data: { id: (result as any).insertId }
    });

  } catch (error) {
    console.error('Error creating customer timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update timer (stop/end timer)
router.put('/:id/stop', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current timer
    const timerQuery = `
      SELECT * FROM customer_timers WHERE id = ? AND is_active = 1
    `;
    const [timer] = await executeQuery(timerQuery, [id]);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Active timer not found'
      });
    }

    // Calculate elapsed time and stop timer
    const updateQuery = `
      UPDATE customer_timers 
      SET end_time = NOW(),
          elapsed_seconds = TIMESTAMPDIFF(SECOND, start_time, NOW()),
          is_active = 0
      WHERE id = ?
    `;

    await executeQuery(updateQuery, [id]);

    // Update table status to available
    await executeQuery('UPDATE restaurant_tables SET status = "available" WHERE id = ?', [timer.table_id]);

    res.json({
      success: true,
      message: 'Timer stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete timer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get timer details before deletion
    const timerQuery = `
      SELECT table_id FROM customer_timers WHERE id = ?
    `;
    const [timer] = await executeQuery(timerQuery, [id]);

    if (!timer) {
      return res.status(404).json({
        success: false,
        message: 'Timer not found'
      });
    }

    // Delete timer
    await executeQuery('DELETE FROM customer_timers WHERE id = ?', [id]);

    // Update table status to available
    await executeQuery('UPDATE restaurant_tables SET status = "available" WHERE id = ?', [timer.table_id]);

    res.json({
      success: true,
      message: 'Timer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting timer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
