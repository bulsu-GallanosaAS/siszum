"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
// List all raw meats
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const [rows] = await database_1.pool.execute(`SELECT id, name, buying_price, quantity_kg, created_at, updated_at FROM raw_meat_inventory ORDER BY name`);
        res.json({ success: true, data: rows });
    }
    catch (err) {
        console.error('raw inventory list error', err);
        res.status(500).json({ success: false, message: 'Failed to fetch raw inventory' });
    }
});
// Create or upsert a raw meat item (limited to Chicken/Pork/Beef)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { name, buying_price, quantity_kg, notes } = req.body;
        const trimmed = String(name || '').trim();
        if (!trimmed) {
            return res.status(400).json({ success: false, message: 'name is required' });
        }
        if (trimmed.length > 100) {
            return res.status(400).json({ success: false, message: 'name too long (max 100)' });
        }
        if (buying_price === undefined || quantity_kg === undefined) {
            return res.status(400).json({ success: false, message: 'buying_price and quantity_kg are required' });
        }
        const [result] = await database_1.pool.execute(`INSERT INTO raw_meat_inventory (name, buying_price, quantity_kg, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE buying_price = VALUES(buying_price), quantity_kg = VALUES(quantity_kg), notes = VALUES(notes)`, [trimmed, parseFloat(buying_price), parseFloat(quantity_kg), (notes ?? null)]);
        res.json({ success: true, message: 'Saved', data: { affectedRows: result.affectedRows } });
    }
    catch (err) {
        console.error('raw inventory create error', err);
        res.status(500).json({ success: false, message: 'Failed to save item' });
    }
});
// Update quantity and/or price
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, buying_price, quantity_kg, notes } = req.body;
        const [current] = await database_1.pool.execute(`SELECT id FROM raw_meat_inventory WHERE id = ?`, [id]);
        if (current.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        const fields = [];
        const params = [];
        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (!trimmed) {
                return res.status(400).json({ success: false, message: 'name cannot be empty' });
            }
            if (trimmed.length > 100) {
                return res.status(400).json({ success: false, message: 'name too long (max 100)' });
            }
            fields.push('name = ?');
            params.push(trimmed);
        }
        if (buying_price !== undefined) {
            fields.push('buying_price = ?');
            params.push(parseFloat(buying_price));
        }
        if (quantity_kg !== undefined) {
            fields.push('quantity_kg = ?');
            params.push(parseFloat(quantity_kg));
        }
        if (notes !== undefined) {
            fields.push('notes = ?');
            params.push(notes || null);
        }
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        const sql = `UPDATE raw_meat_inventory SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        params.push(parseInt(id));
        try {
            await database_1.pool.execute(sql, params);
            res.json({ success: true, message: 'Updated' });
        }
        catch (err) {
            // Duplicate name
            if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
                return res.status(409).json({ success: false, message: 'A product with this name already exists.' });
            }
            throw err;
        }
    }
    catch (err) {
        console.error('raw inventory update error', err);
        res.status(500).json({ success: false, message: 'Failed to update item' });
    }
});
// Delete (rarely used; keeps table constrained to the three types)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.pool.execute(`DELETE FROM raw_meat_inventory WHERE id = ?`, [id]);
        res.json({ success: true, message: 'Deleted' });
    }
    catch (err) {
        console.error('raw inventory delete error', err);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
});
exports.default = router;
//# sourceMappingURL=rawInventory.js.map