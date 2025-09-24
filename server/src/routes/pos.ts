import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'POS route', data: [] });
});

export default router;
