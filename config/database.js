const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            if (this.connection) {
                console.log('Database already connected');
                return this.connection;
            }

            const mongoURI = process.env.MONGODB_URI;
            
            if (!mongoURI) {
                throw new Error('MONGODB_URI environment variable is not set');
            }

            console.log('\n🔌 INITIALIZING DATABASE CONNECTION...');
            console.log(`   🌐 Target: MongoDB Atlas`);
            console.log(`   📍 URI: ${mongoURI.replace(/:[^:@]*@/, ':****@')}`); // Hide password in logs
            console.log(`   ⚙️  Configuration: Production-ready settings`);
            
            this.connection = await mongoose.connect(mongoURI, {
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds
                bufferCommands: false // Disable mongoose buffering
            });

            console.log('\n✅ DATABASE CONNECTION ESTABLISHED!');
            console.log(`   📍 Database: ${mongoose.connection.name}`);
            console.log(`   🌍 Host: ${mongoose.connection.host}`);
            console.log(`   🔗 Status: ${this.getConnectionStatus()}`);
            console.log(`   🛡️  Security: SSL/TLS enabled`);
            
            // Get and display database stats
            try {
                const stats = await this.getStats();
                console.log(`   📊 Collections: ${stats.collections}`);
                console.log(`   📄 Documents: ${stats.documents.toLocaleString()}`);
                console.log(`   💾 Data size: ${stats.dataSize}`);
            } catch (error) {
                console.log(`   📊 Stats: Available after first operation`);
            }
            
            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('📡 MongoDB disconnected');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });

            return this.connection;

        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            
            // Provide helpful error messages
            if (error.message.includes('authentication failed')) {
                console.error('🔑 Check your username and password in the MongoDB URI');
            } else if (error.message.includes('ENOTFOUND')) {
                console.error('🌐 Check your internet connection and MongoDB URI');
            } else if (error.message.includes('IP not in whitelist')) {
                console.error('🚫 Add your IP address to MongoDB Atlas whitelist');
            }
            
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                console.log('📡 MongoDB disconnected');
            }
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    // Get database connection status
    getConnectionStatus() {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        return states[state] || 'unknown';
    }

    // Get database statistics
    async getStats() {
        try {
            if (mongoose.connection.readyState !== 1) {
                throw new Error('Database not connected');
            }

            const stats = await mongoose.connection.db.stats();
            return {
                database: mongoose.connection.name,
                collections: stats.collections,
                dataSize: this.formatBytes(stats.dataSize),
                indexSize: this.formatBytes(stats.indexSize),
                totalSize: this.formatBytes(stats.dataSize + stats.indexSize),
                documents: stats.objects
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = new Database(); 