const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token from HttpOnly cookie
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from HttpOnly cookie
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired.'
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Middleware to check if user is already authenticated (for login/register routes)
const checkNotAuthenticated = (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return res.status(400).json({
                success: false,
                message: 'User is already authenticated.'
            });
        } catch (error) {
            // Token is invalid, continue to login/register
            next();
        }
    } else {
        next();
    }
};

module.exports = {
    authenticateToken,
    checkNotAuthenticated
};