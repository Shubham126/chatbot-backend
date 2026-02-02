// API Key Authentication Middleware
const apiKeyAuth = async (req, res, next) => {
    try {
        // Get API key from headers
        const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
        
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key is required. Please provide x-api-key header.'
            });
        }
        
        // Validate API key against database
        const User = require('../models/User');
        const user = await User.findOne({ apiKey }).select('_id name email apiKey');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid API key. Please check your API key or generate a new one.'
            });
        }
        
        // Store API key and user info in request for later use
        req.apiKey = apiKey;
        req.apiUser = user;
        req.isDemo = false; // All keys are now user-generated
        
        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during API key validation'
        });
    }
};

// Optional: API key validation function for more complex scenarios
const validateApiKey = async (apiKey) => {
    // In a real application, you would:
    // 1. Check against your database
    // 2. Verify the key hasn't expired
    // 3. Check usage limits
    // 4. Log the usage for billing/analytics
    
    try {
        // Simulate database lookup
        const keyInfo = {
            id: apiKey,
            isValid: true,
            plan: apiKey.startsWith('demo-') ? 'demo' : 'pro',
            usage: {
                requests: 0,
                limit: apiKey.startsWith('demo-') ? 100 : 10000
            },
            createdAt: new Date(),
            lastUsed: new Date()
        };
        
        return keyInfo;
    } catch (error) {
        console.error('API key validation error:', error);
        return null;
    }
};

// Middleware for CORS with API key support
const corsWithApiKey = (req, res, next) => {
    // Get origin from request
    const origin = req.headers.origin;
    
    // Always allow localhost and 127.0.0.1 for development
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('file://') || origin.includes(process.env.FRONTEND_URL))) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        // For API requests, allow all origins for SDK compatibility
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization, Cookie, Cache-Control');
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
};

module.exports = {
    apiKeyAuth,
    validateApiKey,
    corsWithApiKey
};