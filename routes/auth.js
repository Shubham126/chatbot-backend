const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken, checkNotAuthenticated } = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validatePasswordChange,
    validateProfileUpdate
} = require('../middleware/validation');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful requests
});

// More restrictive rate limiting for failed login attempts
const strictAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 failed attempts per hour
    message: {
        success: false,
        message: 'Too many failed login attempts. Please try again in 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => res.statusCode < 400 // Only count failed requests
});

// General rate limiting for other auth operations
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Public routes (no authentication required)

// Check authentication status
router.get('/check', generalLimiter, authController.checkAuth);

// Register new user
router.post('/register', 
    authLimiter,
    checkNotAuthenticated,
    validateRegister,
    authController.register
);

// Login user
router.post('/login',
    strictAuthLimiter,
    authLimiter,
    checkNotAuthenticated,
    validateLogin,
    authController.login
);

// Protected routes (authentication required)

// Get current user profile
router.get('/profile',
    generalLimiter,
    authenticateToken,
    authController.getProfile
);

// Logout user
router.post('/logout',
    generalLimiter,
    authenticateToken,
    authController.logout
);

// Update user profile
router.put('/profile',
    generalLimiter,
    authenticateToken,
    validateProfileUpdate,
    async (req, res) => {
        try {
            const { validationResult } = require('express-validator');
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const User = require('../models/User');
            const { name, email } = req.body;
            const userId = req.user._id;

            // Check if email is being changed and if it's already taken
            if (email && email !== req.user.email) {
                const existingUser = await User.findOne({ email, _id: { $ne: userId } });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email is already taken by another user'
                    });
                }
            }

            // Update user
            const updateData = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    lastLogin: updatedUser.lastLogin,
                    createdAt: updatedUser.createdAt
                }
            });

        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during profile update'
            });
        }
    }
);

// Change password
router.put('/password',
    generalLimiter,
    authenticateToken,
    validatePasswordChange,
    async (req, res) => {
        try {
            const { validationResult } = require('express-validator');
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const User = require('../models/User');
            const { currentPassword, newPassword } = req.body;
            const userId = req.user._id;

            // Get user with password
            const user = await User.findById(userId);
            
            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during password change'
            });
        }
    }
);

// Generate or regenerate API key
router.post('/api-key/generate',
    generalLimiter,
    authenticateToken,
    async (req, res) => {
        try {
            const crypto = require('crypto');
            const User = require('../models/User');
            const userId = req.user._id;

            // Generate a secure API key
            const apiKey = 'ck_' + crypto.randomBytes(32).toString('hex');

            // Update user with new API key
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { apiKey },
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'API key generated successfully',
                apiKey: updatedUser.apiKey
            });

        } catch (error) {
            console.error('API key generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during API key generation'
            });
        }
    }
);

// Get current API key
router.get('/api-key',
    generalLimiter,
    authenticateToken,
    async (req, res) => {
        try {
            const User = require('../models/User');
            const user = await User.findById(req.user._id).select('apiKey');

            res.json({
                success: true,
                apiKey: user.apiKey
            });

        } catch (error) {
            console.error('API key retrieval error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during API key retrieval'
            });
        }
    }
);

// Revoke API key
router.delete('/api-key',
    generalLimiter,
    authenticateToken,
    async (req, res) => {
        try {
            const User = require('../models/User');
            const userId = req.user._id;

            // Remove API key
            await User.findByIdAndUpdate(
                userId,
                { apiKey: null },
                { new: true }
            );

            res.json({
                success: true,
                message: 'API key revoked successfully'
            });

        } catch (error) {
            console.error('API key revocation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during API key revocation'
            });
        }
    }
);

// API Key Validation Route (for SDK)
router.post('/validate-api-key', generalLimiter, async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }
        
        // Find user with this API key
        const user = await User.findOne({ apiKey }).select('_id isActive');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive API key'
            });
        }
        
        res.json({
            success: true,
            message: 'API key is valid'
        });
    } catch (error) {
        console.error('Error validating API key:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate API key'
        });
    }
});

module.exports = router;