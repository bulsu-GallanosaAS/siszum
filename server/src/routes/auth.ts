import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { Admin, LoginRequest, LoginResponse, ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()
      });
    }

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const users = await executeQuery(
      'SELECT * FROM admins WHERE email = ? AND is_active = TRUE',
      [email]
    ) as Admin[];

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await executeQuery(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    const response: ApiResponse<LoginResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const response: ApiResponse<Admin> = {
      success: true,
      message: 'User retrieved successfully',
      data: req.user
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// Update profile
router.put('/profile', [
  authenticateToken
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    console.log('Update profile request received');
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.user?.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array()
      });
    }

    const { first_name, last_name, phone, date_of_birth, city, country } = req.body;

    console.log('Extracted fields:', { first_name, last_name, phone, date_of_birth, city, country });

    const updateResult = await executeQuery(
      `UPDATE admins SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        updated_at = NOW()
      WHERE id = ?`,
      [first_name, last_name, phone, date_of_birth, city, country, req.user?.id]
    );

    console.log('Update result:', updateResult);

    // Get updated user
    const updatedUser = await executeQuery(
      'SELECT id, username, email, first_name, last_name, phone, avatar_url, date_of_birth, city, country, role, is_active FROM admins WHERE id = ?',
      [req.user?.id]
    ) as Admin[];

    const response: ApiResponse<Admin> = {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0]
    };

    res.json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.json(response);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

export default router;
