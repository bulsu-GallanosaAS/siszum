"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                error: errors.array()
            });
        }
        const { email, password } = req.body;
        // Find user by email
        const users = await (0, database_1.executeQuery)('SELECT * FROM admins WHERE email = ? AND is_active = TRUE', [email]);
        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const user = users[0];
        // Check password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Update last login
        await (0, database_1.executeQuery)('UPDATE admins SET last_login = NOW() WHERE id = ?', [user.id]);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;
        const response = {
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});
// Get current user
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const response = {
            success: true,
            message: 'User retrieved successfully',
            data: req.user
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
});
// Update profile
router.put('/profile', [
    auth_1.authenticateToken
], async (req, res) => {
    try {
        console.log('Update profile request received');
        console.log('Request body:', req.body);
        console.log('User ID from token:', req.user?.id);
        const errors = (0, express_validator_1.validationResult)(req);
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
        const updateResult = await (0, database_1.executeQuery)(`UPDATE admins SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        date_of_birth = COALESCE(?, date_of_birth),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        updated_at = NOW()
      WHERE id = ?`, [first_name, last_name, phone, date_of_birth, city, country, req.user?.id]);
        console.log('Update result:', updateResult);
        // Get updated user
        const updatedUser = await (0, database_1.executeQuery)('SELECT id, username, email, first_name, last_name, phone, avatar_url, date_of_birth, city, country, role, is_active FROM admins WHERE id = ?', [req.user?.id]);
        const response = {
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser[0]
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});
// Logout
router.post('/logout', auth_1.authenticateToken, async (req, res) => {
    try {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just return success
        const response = {
            success: true,
            message: 'Logout successful'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map