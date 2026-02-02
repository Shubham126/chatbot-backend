const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
 
// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

const database = require('./config/database');
const scrapeRoutes = require('./routes/scrape');
const authRoutes = require('./routes/auth');
const seoToolsRoutes = require('./routes/seoTools');
const errorHandler = require('./middleware/errorHandler');
const { corsWithApiKey } = require('./middleware/apiKeyAuth');

const app = express();
const PORT = process.env.PORT || 3000;

// Global rate limiting - more lenient for development
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development/testing
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost/127.0.0.1 during development
        const origin = req.headers.origin || req.headers.referer;
        return origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
    }
});

// Middleware
app.use(globalLimiter);

// Add basic CORS as fallback before custom CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost and 127.0.0.1 in any port
        if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('file://')) {
            return callback(null, true);
        }
        
        // Allow all origins for now (can be restricted later)
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'x-api-key', 'Authorization', 'Cookie', 'Cache-Control']
}));

app.use(corsWithApiKey); // Custom CORS with API key support
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public','frontend')));
// Serve chatbot SDK files
app.use('/chatbot-sdk', express.static(path.join(__dirname, '../chatbot-sdk')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api', seoToolsRoutes);

// Serve main app for authenticated users
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','frontend','index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        const packageInfo = require('./package.json');
        console.log('\n' + '='.repeat(70));
        console.log('🚀 CHATFLOW AI - INTELLIGENT WEBSITE ANALYSIS');
        console.log(`   Version ${packageInfo.version} | ${new Date().toLocaleString()}`);
        console.log('='.repeat(70));
        
        console.log('\n💻 SYSTEM INFORMATION:');
        console.log(`   🖥️  Platform: ${process.platform} (${process.arch})`);
        console.log(`   🟢 Node.js: ${process.version}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`);
        console.log(`   📦 PID: ${process.pid}`);
        
        // Connect to MongoDB
        await database.connect();
        
        // Start server
        app.listen(PORT, () => {
            console.log('\n📡 SERVER STATUS:');
            console.log(`   ✅ Server running at: http://localhost:${PORT}`);
            console.log(`   📁 Frontend path: ${path.join(__dirname, '../frontend')}`);
            console.log(`   🌐 CORS enabled: All origins allowed`);
            console.log(`   📦 Environment: ${process.env.NODE_ENV || 'development'}`);
            

            
            console.log('\n🛠️  FEATURES ENABLED:');
            console.log('   ✅ Comprehensive web scraping (zero limitations)');
            console.log('   ✅ MongoDB Atlas storage');
            console.log('   ✅ Google Gemini AI integration');
            console.log('   ✅ Smart content optimization');
            console.log('   ✅ Real-time chat interface');
            
            console.log('\n' + '='.repeat(70));
            console.log('🎯 READY TO PROCESS WEBSITES! Send requests to start scraping...');
            console.log('⚡ Maximum content extraction | Zero limitations | AI-powered analysis');
            console.log('='.repeat(70) + '\n');
        });
        
    } catch (error) {
        console.log('\n' + '❌'.repeat(20));
        console.error('💥 STARTUP FAILED:', error.message);
        console.error('💡 TROUBLESHOOTING:');
        console.error('   • Check MongoDB Atlas connection in .env file');
        console.error('   • Verify Gemini AI API key is configured');
        console.error('   • Ensure port 3000 is available');
        console.log('❌'.repeat(20) + '\n');
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n' + '🛑'.repeat(20));
    console.log('⏹️  SHUTTING DOWN CHATFLOW AI SERVER');
    console.log('🛑'.repeat(20));
    console.log('\n🔄 Cleanup process initiated...');
    try {
        console.log('   📡 Closing database connections...');
        await database.disconnect();
        console.log('   ✅ Database disconnected successfully');
        console.log('   🔌 Server connections closed');
        console.log('\n✅ SHUTDOWN COMPLETE - Server terminated safely');
        console.log('👋 Thank you for using ChatFlow AI!\n');
        process.exit(0);
    } catch (error) {
        console.log('\n❌ SHUTDOWN ERROR:');
        console.error('   💥 Error during cleanup:', error.message);
        console.log('   🔥 Forcing shutdown...\n');
        process.exit(1);
    }
});

// Start the server
startServer();

module.exports = app;