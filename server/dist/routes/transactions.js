"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Get all transactions with filtering and pagination
router.get("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, payment_method, date_from, date_to, search, } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereConditions = [];
        let queryParams = [];
        // Build WHERE conditions
        if (status) {
            whereConditions.push("t.status = ?");
            queryParams.push(status);
        }
        if (payment_method) {
            whereConditions.push("t.payment_method = ?");
            queryParams.push(payment_method);
        }
        if (date_from) {
            whereConditions.push("DATE(t.payment_date) >= ?");
            queryParams.push(date_from);
        }
        if (date_to) {
            whereConditions.push("DATE(t.payment_date) <= ?");
            queryParams.push(date_to);
        }
        if (search) {
            whereConditions.push("(t.transaction_code LIKE ? OR t.reference_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)");
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";
        // Get transactions with customer and order details
        const transactionsQuery = `
      SELECT 
        t.id,
        t.transaction_code,
        t.order_id,
        t.customer_id,
        t.payment_method,
        t.amount,
        t.status,
        t.reference_number,
        t.payment_date,
        t.payment_time,
        t.created_at,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        o.order_code,
        o.total_amount as order_total,
        o.table_id,
        rt.table_number
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        queryParams.push(Number(limit), offset);
        const transactions = await (0, database_1.executeQuery)(transactionsQuery, queryParams);
        // Get total count for pagination
        const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN orders o ON t.order_id = o.id
      ${whereClause}
      
    `;
        const countParams = queryParams.slice(0, -2); // Remove limit and offset
        const [{ total }] = await (0, database_1.executeQuery)(countQuery, countParams);
        // Get statistics
        const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN DATE(payment_date) = CURDATE() THEN amount ELSE 0 END) as today_revenue,
        COUNT(CASE WHEN DATE(payment_date) = CURDATE() THEN 1 END) as today_transactions
      FROM transactions
      WHERE status = 'completed'
    `;
        const [stats] = await (0, database_1.executeQuery)(statsQuery);
        const [reservationStats] = await (0, database_1.executeQuery)(`
      SELECT 
        COUNT(*) * 100 AS total_reservations_fee,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 100 ELSE 0 END) AS today_reservations_fee
      FROM reservations
    `);
        stats.total_reservations_fee = reservationStats.total_reservations_fee;
        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalItems: total,
                    itemsPerPage: Number(limit),
                },
                stats,
            },
        });
    }
    catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
// Get transaction by ID
router.get("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const transactionQuery = `
      SELECT 
        t.*,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        o.order_code,
        o.total_amount as order_total,
        o.table_id,
        rt.table_number
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN orders o ON t.order_id = o.id
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      WHERE t.id = ?
    `;
        const [transaction] = await (0, database_1.executeQuery)(transactionQuery, [id]);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        res.json({
            success: true,
            data: transaction,
        });
    }
    catch (error) {
        console.error("Error fetching transaction:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map