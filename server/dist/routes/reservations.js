"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("../middleware/multer"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const router = express_1.default.Router();
// Get all reservations
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const reservations = await (0, database_1.executeQuery)(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `);
        const response = {
            success: true,
            message: 'Reservations retrieved successfully',
            data: reservations
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations'
        });
    }
});
// Get reservation by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const reservations = await (0, database_1.executeQuery)(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.id = ?
    `, [id]);
        if (reservations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }
        const response = {
            success: true,
            message: 'Reservation retrieved successfully',
            data: reservations[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservation'
        });
    }
});
// Upload reservation payment proof
router.post('/:id/proof', auth_1.authenticateToken, multer_1.default.single('proof'), async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure file exists
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // Validate mimetype and size (multer already enforces, double-check for clarity)
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(req.file.mimetype)) {
            return res.status(400).json({ success: false, message: 'Invalid file type. Allowed: JPG, PNG, WEBP' });
        }
        // Check reservation exists
        const rows = await (0, database_1.executeQuery)('SELECT id, payment_proof_public_id FROM reservations WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        const existingPublicId = rows[0].payment_proof_public_id;
        // Delete previous proof if exists
        if (existingPublicId) {
            try {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(existingPublicId);
            }
            catch (e) { /* non-fatal */ }
        }
        // Upload new image
        const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, 'reservations/proofs');
        // Update reservation with proof details
        await (0, database_1.executeQuery)(`UPDATE reservations 
         SET payment_proof_url = ?, payment_proof_public_id = ?, payment_uploaded_at = NOW(), payment_status = 'pending_review', updated_at = NOW()
         WHERE id = ?`, [uploadResult.secure_url, uploadResult.public_id, id]);
        // Return updated reservation
        const [reservation] = await (0, database_1.executeQuery)(`SELECT r.*, rt.table_number FROM reservations r LEFT JOIN restaurant_tables rt ON r.table_id = rt.id WHERE r.id = ?`, [id]);
        const response = {
            success: true,
            message: 'Payment proof uploaded successfully',
            data: reservation
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.error('Error uploading payment proof:', error);
        if (error?.message?.includes('File too large')) {
            return res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
        }
        return res.status(500).json({ success: false, message: 'Failed to upload payment proof' });
    }
});
// Create new reservation
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('customer_name').isLength({ min: 2 }).withMessage('Customer name is required'),
    (0, express_validator_1.body)('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('table_id').isInt().withMessage('Table ID is required'),
    (0, express_validator_1.body)('number_of_guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
    (0, express_validator_1.body)('reservation_date').isDate().withMessage('Valid reservation date is required'),
    (0, express_validator_1.body)('reservation_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { customer_name, phone, email, table_id, occasion, number_of_guests, reservation_date, reservation_time, duration_hours = 2, payment_amount = 0, notes } = req.body;
        // Generate reservation code
        const reservation_code = `RES${Date.now()}`;
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO reservations (
        reservation_code, customer_name, phone, email, table_id, occasion,
        number_of_guests, reservation_date, reservation_time, duration_hours,
        payment_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            reservation_code, customer_name, phone, email, table_id, occasion,
            number_of_guests, reservation_date, reservation_time, duration_hours,
            payment_amount, notes
        ]);
        const response = {
            success: true,
            message: 'Reservation created successfully',
            data: { id: result.insertId, reservation_code }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create reservation'
        });
    }
});
// Update reservation status
router.put('/:id/status', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const { status } = req.body;
        // Fetch current status and fee to determine transition behavior
        const [current] = await (0, database_1.executeQuery)('SELECT status, COALESCE(reservation_fee_amount, 0) AS reservation_fee_amount FROM reservations WHERE id = ?', [id]);
        if (!current) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }
        // Check if the table has a confirmed_at column (schema may vary)
        let hasConfirmedAt = false;
        try {
            const col = await (0, database_1.executeQuery)("SHOW COLUMNS FROM reservations LIKE 'confirmed_at'");
            hasConfirmedAt = Array.isArray(col) && col.length > 0;
        }
        catch (_) {
            // ignore schema probe errors
        }
        // Build update pieces
        const updates = ['status = ?', 'updated_at = NOW()'];
        const params = [status];
        // On transition to confirmed, apply a one-time ₱100 fee
        if (status === 'confirmed' && current.status !== 'confirmed') {
            // Only set if not previously set (idempotent)
            if ((current.reservation_fee_amount || 0) <= 0) {
                updates.push('reservation_fee_amount = 100');
            }
            if (hasConfirmedAt) {
                updates.push('confirmed_at = NOW()');
            }
        }
        params.push(id);
        await (0, database_1.executeQuery)(`UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`, params);
        const response = {
            success: true,
            message: 'Reservation status updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reservation status'
        });
    }
});
// Update reservation
router.put('/:id', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('customer_name').optional().isLength({ min: 2 }),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('email').optional().isEmail(),
    (0, express_validator_1.body)('table_id').optional().isInt(),
    (0, express_validator_1.body)('number_of_guests').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('reservation_date').optional().isDate(),
    (0, express_validator_1.body)('reservation_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { id } = req.params;
        const updates = req.body;
        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        await (0, database_1.executeQuery)(`UPDATE reservations SET ${setClause}, updated_at = NOW() WHERE id = ?`, [...values, id]);
        const response = {
            success: true,
            message: 'Reservation updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update reservation'
        });
    }
});
// Delete reservation
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await (0, database_1.executeQuery)('DELETE FROM reservations WHERE id = ?', [id]);
        const response = {
            success: true,
            message: 'Reservation deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reservation'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reservations.js.map