"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get dashboard statistics
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        // Get total revenue from completed orders
        const revenueResult = await (0, database_1.executeQuery)(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders 
      WHERE status = 'completed'
    `);
        // Get total orders count
        const totalOrdersResult = await (0, database_1.executeQuery)('SELECT COUNT(*) as count FROM orders');
        // Get total customers count
        const totalCustomersResult = await (0, database_1.executeQuery)('SELECT COUNT(*) as count FROM customers');
        // Get total reservations count
        const totalReservationsResult = await (0, database_1.executeQuery)('SELECT COUNT(*) as count FROM reservations');
        // Get active timers count (if you have a timers table)
        const activeTimersResult = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM timers 
      WHERE status = 'running'
    `).catch(() => [{ count: 0 }]);
        // Get low stock items count
        const lowStockResult = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM menu_items 
      WHERE quantity_in_stock <= 10 AND is_unlimited = FALSE
    `);
        const stats = {
            total_revenue: revenueResult[0]?.total_revenue || 0,
            total_orders: totalOrdersResult[0]?.count || 0,
            total_customers: totalCustomersResult[0]?.count || 0,
            total_reservations: totalReservationsResult[0]?.count || 0,
            active_timers: activeTimersResult[0]?.count || 0,
            low_stock_items: lowStockResult[0]?.count || 0
        };
        const response = {
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: stats
        };
        res.json(response);
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard statistics'
        });
    }
});
// Get upcoming guests
router.get('/upcoming-guests', auth_1.authenticateToken, async (req, res) => {
    try {
        // Use reservations table instead of non-existent upcoming_guests table
        const upcomingGuests = await (0, database_1.executeQuery)(`
      SELECT 
        id,
        customer_name,
        phone_number,
        number_of_guests,
        reservation_date,
        reservation_time
      FROM reservations 
      WHERE reservation_date >= CURDATE()
      ORDER BY reservation_date ASC, reservation_time ASC
      LIMIT 10
    `);
        const response = {
            success: true,
            message: 'Upcoming guests retrieved successfully',
            data: upcomingGuests
        };
        res.json(response);
    }
    catch (error) {
        console.error('Upcoming guests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get upcoming guests'
        });
    }
});
// Get pending orders
router.get('/pending-orders', auth_1.authenticateToken, async (req, res) => {
    try {
        // Use orders table instead of non-existent active_orders table
        const pendingOrders = await (0, database_1.executeQuery)(`
      SELECT 
        o.id,
        o.order_code,
        o.customer_name,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      WHERE o.status = 'pending' 
      ORDER BY o.created_at DESC 
      LIMIT 10
    `);
        const response = {
            success: true,
            message: 'Pending orders retrieved successfully',
            data: pendingOrders
        };
        res.json(response);
    }
    catch (error) {
        console.error('Pending orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending orders'
        });
    }
});
// Get top products
router.get('/top-products', auth_1.authenticateToken, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const topProducts = await (0, database_1.executeQuery)(`
      SELECT 
        mi.id,
        mi.name,
        mi.selling_price,
        SUM(oi.quantity) as total_sales,
        SUM(oi.total_price) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM menu_items mi
      INNER JOIN order_items oi ON mi.id = oi.menu_item_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY mi.id, mi.name, mi.selling_price
      ORDER BY total_sales DESC
      LIMIT ?
    `, [Number(limit)]);
        const response = {
            success: true,
            message: 'Top products retrieved successfully',
            data: topProducts
        };
        res.json(response);
    }
    catch (error) {
        console.error('Top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get top products'
        });
    }
});
// Get recent orders
router.get('/recent-orders', auth_1.authenticateToken, async (req, res) => {
    try {
        const recentOrders = await (0, database_1.executeQuery)(`
      SELECT 
        o.id,
        o.order_code,
        o.customer_name,
        rt.table_number,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN restaurant_tables rt ON o.table_id = rt.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY o.id
      ORDER BY o.created_at DESC 
      LIMIT 10
    `);
        const response = {
            success: true,
            message: 'Recent orders retrieved successfully',
            data: recentOrders
        };
        res.json(response);
    }
    catch (error) {
        console.error('Recent orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent orders'
        });
    }
});
// Get revenue chart data
router.get('/revenue-chart', auth_1.authenticateToken, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const chartData = await (0, database_1.executeQuery)(`
      SELECT 
        DATE(payment_date) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM transactions 
      WHERE status = 'completed' 
        AND payment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(payment_date)
      ORDER BY date DESC
    `, [days]);
        const response = {
            success: true,
            message: 'Revenue chart data retrieved successfully',
            data: chartData
        };
        res.json(response);
    }
    catch (error) {
        console.error('Revenue chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get revenue chart data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map