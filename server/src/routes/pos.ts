import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'POS route', data: [] });
});

export default router;
