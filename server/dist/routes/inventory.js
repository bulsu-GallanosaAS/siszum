"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// Get all inventory items
router.get('/items', auth_1.authenticateToken, async (req, res) => {
    try {
        const [rows] = await database_1.pool.execute(`
      SELECT 
        mi.id,
        mi.product_code,
        mi.name,
        mi.description,
        mi.selling_price,
        mi.purchase_price,
        mi.purchase_value,
        mi.quantity_in_stock,
        mi.unit_type,
        mi.availability,
        mi.image_url,
        mi.is_unlimited,
        mi.is_premium,
        mi.created_at,
        mi.updated_at,
        mc.name as category_name,
        mc.id as category_id
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mc.sort_order, mi.name
    `);
        res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory data'
        });
    }
});
// Get inventory categories
router.get('/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const [rows] = await database_1.pool.execute(`
      SELECT id, name, description, sort_order
      FROM menu_categories
      WHERE is_active = TRUE
      ORDER BY sort_order
    `);
        res.json({
            success: true,
            data: rows
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});
// Get inventory statistics
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const [totalItems] = await database_1.pool.execute(`
      SELECT COUNT(*) as total FROM menu_items
    `);
        // Calculate total sales revenue from completed orders
        const [totalValue] = await database_1.pool.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as total_value 
      FROM orders
      WHERE status = 'completed'
    `);
        const [lowStock] = await database_1.pool.execute(`
      SELECT COUNT(*) as low_stock FROM menu_items
      WHERE quantity_in_stock <= 10 AND is_unlimited = FALSE
    `);
        const [outOfStock] = await database_1.pool.execute(`
      SELECT COUNT(*) as out_of_stock FROM menu_items
      WHERE quantity_in_stock = 0 AND is_unlimited = FALSE
    `);
        res.json({
            success: true,
            data: {
                total_items: totalItems[0].total,
                total_value: totalValue[0].total_value || 0,
                low_stock: lowStock[0].low_stock,
                out_of_stock: outOfStock[0].out_of_stock
            }
        });
    }
    catch (error) {
        console.error('Error fetching inventory stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory statistics'
        });
    }
});
// Add new inventory item
router.post('/items', auth_1.authenticateToken, async (req, res) => {
    try {
        const { product_code, name, description, category_id, selling_price, purchase_price, purchase_value, quantity_in_stock, unit_type, availability, image_url, is_unlimited, is_premium } = req.body;
        // Validate required fields
        if (!product_code || !name || !category_id || selling_price === undefined || selling_price === null) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: product_code, name, category_id, and selling_price are required'
            });
        }
        // Sanitize numeric values
        const sanitizedQuantity = quantity_in_stock === null || quantity_in_stock === undefined || quantity_in_stock === '' ? 0 : parseInt(quantity_in_stock);
        const sanitizedPurchasePrice = purchase_price === null || purchase_price === undefined || purchase_price === '' ? null : parseFloat(purchase_price);
        const sanitizedPurchaseValue = sanitizedPurchasePrice && sanitizedQuantity ? sanitizedPurchasePrice * sanitizedQuantity : 0;
        const [result] = await database_1.pool.execute(`
      INSERT INTO menu_items (
        product_code, name, description, category_id, selling_price,
        purchase_price, purchase_value, quantity_in_stock, unit_type,
        availability, image_url, is_unlimited, is_premium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            product_code,
            name,
            description || null,
            parseInt(category_id),
            parseFloat(selling_price),
            sanitizedPurchasePrice,
            sanitizedPurchaseValue,
            sanitizedQuantity,
            unit_type || 'piece',
            availability || 'available',
            image_url || null,
            Boolean(is_unlimited),
            Boolean(is_premium)
        ]);
        res.json({
            success: true,
            message: 'Inventory item added successfully',
            data: { id: result.insertId }
        });
    }
    catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add inventory item',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Update inventory item
router.put('/items/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { product_code, name, description, category_id, selling_price, purchase_price, purchase_value, quantity_in_stock, unit_type, availability, image_url, is_unlimited, is_premium } = req.body;
        // Sanitize numeric values
        const sanitizedQuantity = quantity_in_stock === null || quantity_in_stock === undefined || quantity_in_stock === '' ? 0 : parseInt(quantity_in_stock);
        const sanitizedPurchasePrice = purchase_price === null || purchase_price === undefined || purchase_price === '' ? null : parseFloat(purchase_price);
        const sanitizedPurchaseValue = purchase_value === null || purchase_value === undefined || purchase_value === '' ? 0 : parseFloat(purchase_value);
        await database_1.pool.execute(`
      UPDATE menu_items SET
        product_code = ?, name = ?, description = ?, category_id = ?,
        selling_price = ?, purchase_price = ?, purchase_value = ?,
        quantity_in_stock = ?, unit_type = ?, availability = ?,
        image_url = ?, is_unlimited = ?, is_premium = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
            product_code || null,
            name || null,
            description || null,
            category_id ? parseInt(category_id) : null,
            selling_price ? parseFloat(selling_price) : null,
            sanitizedPurchasePrice,
            sanitizedPurchaseValue,
            sanitizedQuantity,
            unit_type || null,
            availability || null,
            image_url || null,
            Boolean(is_unlimited),
            Boolean(is_premium),
            parseInt(id)
        ]);
        res.json({
            success: true,
            message: 'Inventory item updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update inventory item',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Delete inventory item
router.delete('/items/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);
        res.json({
            success: true,
            message: 'Inventory item deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete inventory item'
        });
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map