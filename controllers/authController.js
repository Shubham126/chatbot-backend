const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Set authentication cookie
const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('authToken', token, {
        httpOnly: true, // Prevent XSS attacks
        secure: isProduction, // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });
};

// Register new user
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({
            email,
            password,
            name
        });

        await user.save();

        // Generate token and set cookie
        const token = generateToken(user._id);
        setAuthCookie(res, token);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token and set cookie
        const token = generateToken(user._id);
        setAuthCookie(res, token);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Logout user
const logout = (req, res) => {
    try {
        // Clear the authentication cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                lastLogin: req.user.lastLogin,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Check authentication status
const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.json({
                success: false,
                authenticated: false,
                message: 'No authentication token found'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.json({
                success: false,
                authenticated: false,
                message: 'Invalid token or user not found'
            });
        }

        res.json({
            success: true,
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        res.json({
            success: false,
            authenticated: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    checkAuth
};