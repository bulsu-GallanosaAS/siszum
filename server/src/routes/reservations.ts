import express from 'express';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '../types';
import upload from '../middleware/multer';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';

const router = express.Router();

interface Reservation {
  id: number;
  reservation_code: string;
  customer_name: string;
  phone: string;
  email?: string;
  table_id: number;
  table_number: string;
  occasion?: string;
  number_of_guests: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  payment_amount: number;
  payment_status: 'unpaid' | 'pending_review' | 'approved' | 'rejected' | 'pending' | 'paid' | 'cancelled';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  payment_proof_url?: string | null;
  payment_proof_public_id?: string | null;
  payment_uploaded_at?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
}

// Get all reservations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const reservations = await executeQuery(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `) as Reservation[];

    const response: ApiResponse<Reservation[]> = {
      success: true,
      message: 'Reservations retrieved successfully',
      data: reservations
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations'
    });
  }
});

// Get reservation by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    const reservations = await executeQuery(`
      SELECT 
        r.*,
        rt.table_number
      FROM reservations r
      LEFT JOIN restaurant_tables rt ON r.table_id = rt.id
      WHERE r.id = ?
    `, [id]) as Reservation[];

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    const response: ApiResponse<Reservation> = {
      success: true,
      message: 'Reservation retrieved successfully',
      data: reservations[0]
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservation'
    });
  }
});

// Upload reservation payment proof
router.post(
  '/:id/proof',
  authenticateToken,
  upload.single('proof'),
  async (req: AuthenticatedRequest, res: express.Response) => {
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
      const rows = await executeQuery('SELECT id, payment_proof_public_id FROM reservations WHERE id = ?', [id]) as any[];
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reservation not found' });
      }

      const existingPublicId = rows[0].payment_proof_public_id as string | null;

      // Delete previous proof if exists
      if (existingPublicId) {
        try { await deleteFromCloudinary(existingPublicId); } catch (e) { /* non-fatal */ }
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'reservations/proofs');

      // Update reservation with proof details
      await executeQuery(
        `UPDATE reservations 
         SET payment_proof_url = ?, payment_proof_public_id = ?, payment_uploaded_at = NOW(), payment_status = 'pending_review', updated_at = NOW()
         WHERE id = ?`,
        [uploadResult.secure_url, uploadResult.public_id, id]
      );

      // Return updated reservation
      const [reservation] = await executeQuery(
        `SELECT r.*, rt.table_number FROM reservations r LEFT JOIN restaurant_tables rt ON r.table_id = rt.id WHERE r.id = ?`,
        [id]
      ) as Reservation[];

      const response: ApiResponse<Reservation> = {
        success: true,
        message: 'Payment proof uploaded successfully',
        data: reservation
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('Error uploading payment proof:', error);
      if (error?.message?.includes('File too large')) {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
      }
      return res.status(500).json({ success: false, message: 'Failed to upload payment proof' });
    }
  }
);

// Create new reservation
router.post('/', [
  authenticateToken,
  body('customer_name').isLength({ min: 2 }).withMessage('Customer name is required'),
  body('phone').isMobilePhone('any').withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('table_id').isInt().withMessage('Table ID is required'),
  body('number_of_guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
  body('reservation_date').isDate().withMessage('Valid reservation date is required'),
  body('reservation_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      customer_name,
      phone,
      email,
      table_id,
      occasion,
      number_of_guests,
      reservation_date,
      reservation_time,
      duration_hours = 2,
      payment_amount = 0,
      notes
    } = req.body;

    // Generate reservation code
    const reservation_code = `RES${Date.now()}`;

    const result = await executeQuery(`
      INSERT INTO reservations (
        reservation_code, customer_name, phone, email, table_id, occasion,
        number_of_guests, reservation_date, reservation_time, duration_hours,
        payment_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      reservation_code, customer_name, phone, email, table_id, occasion,
      number_of_guests, reservation_date, reservation_time, duration_hours,
      payment_amount, notes
    ]) as any;

    const response: ApiResponse = {
      success: true,
      message: 'Reservation created successfully',
      data: { id: result.insertId, reservation_code }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation'
    });
  }
});

// Update reservation status
router.put('/:id/status', [
  authenticateToken,
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    await executeQuery(
      'UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Reservation status updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation status'
    });
  }
});

// Update reservation
router.put('/:id', [
  authenticateToken,
  body('customer_name').optional().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone('any'),
  body('email').optional().isEmail(),
  body('table_id').optional().isInt(),
  body('number_of_guests').optional().isInt({ min: 1 }),
  body('reservation_date').optional().isDate(),
  body('reservation_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
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

    await executeQuery(
      `UPDATE reservations SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Reservation updated successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reservation'
    });
  }
});

// Delete reservation
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    await executeQuery('DELETE FROM reservations WHERE id = ?', [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Reservation deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reservation'
    });
  }
});

export default router;
