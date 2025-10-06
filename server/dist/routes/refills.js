"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Get all refill requests
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, table_code } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereConditions = [];
        let queryParams = [];
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
        const refills = await (0, database_1.executeQuery)(refillsQuery, queryParams);
        const countQuery = `
      SELECT COUNT(*) as total
      FROM refill_requests rr
      ${whereClause}
    `;
        const [{ total }] = await (0, database_1.executeQuery)(countQuery, queryParams);
        // Get statistics
        const statsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as ongoing_requests,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_requests
      FROM refill_requests
    `;
        const [stats] = await (0, database_1.executeQuery)(statsQuery);
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
    }
    catch (error) {
        console.error('Error fetching refill requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch refill requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Update refill request status
router.put('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id || 1;
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
        await (0, database_1.executeQuery)(updateQuery, [status, userId, status, id]);
        res.json({
            success: true,
            message: 'Refill request status updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating refill request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update refill request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Create new refill request
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { table_code, table_id, customer_id, request_type, price = 200.00 } = req.body;
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
        const result = await (0, database_1.executeQuery)(insertQuery, [table_code, table_id, customer_id, request_type, price]);
        res.json({
            success: true,
            message: 'Refill request created successfully',
            data: { id: result.insertId }
        });
    }
    catch (error) {
        console.error('Error creating refill request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create refill request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=refills.js.map