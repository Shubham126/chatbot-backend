const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    // Session identifier (compatible with existing system)
    sessionId: {
        type: String,
        required: true,
        default: () => Date.now().toString()
    },
    
    // Request information
    url: {
        type: String,
        required: true,
        trim: true
    },
    
    question: {
        type: String,
        required: true,
        trim: true
    },
    
    // AI Response
    aiResponse: {
        type: String,
        required: true
    },
    
    // Scraped data (embedded document)
    scrapedData: {
        url: String,
        title: String,
        description: String,
        headings: [{
            level: String,
            text: String
        }],
        paragraphs: [String],
        links: [{
            url: String,
            text: String
        }],
        timestamp: Date,
        note: String,
        error: Boolean
    },
    
    // User association (for user-specific chat history)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Session metadata
    metadata: {
        processingTime: {
            type: Number, // milliseconds
            default: 0
        },
        tokensUsed: {
            type: Number,
            default: 0
        },
        model: {
            type: String,
            default: 'gpt-3.5-turbo'
        },
        version: {
            type: String,
            default: '1.0.0'
        }
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
SessionSchema.index({ url: 1 });
SessionSchema.index({ timestamp: -1 });
SessionSchema.index({ userId: 1 }); // Filter by user
SessionSchema.index({ userId: 1, timestamp: -1 }); // User sessions by date
SessionSchema.index({ sessionId: 1 }, { unique: true });
SessionSchema.index({ question: 'text', aiResponse: 'text' }); // Text search

// Virtual for display title
SessionSchema.virtual('displayTitle').get(function() {
    return this.scrapedData?.title || 'No title';
});

// Virtual for formatted timestamp
SessionSchema.virtual('formattedTimestamp').get(function() {
    return this.timestamp.toLocaleString();
});

// Static method to create from session data (compatibility)
SessionSchema.statics.createFromSessionData = function(sessionData, userId) {
    return new this({
        sessionId: sessionData.id || Date.now().toString(),
        url: sessionData.url,
        question: sessionData.question,
        aiResponse: sessionData.aiResponse,
        scrapedData: sessionData.scrapedData,
        userId: userId,
        timestamp: sessionData.timestamp ? new Date(sessionData.timestamp) : new Date()
    });
};

// Instance method to convert to old format (for backward compatibility)
SessionSchema.methods.toOldFormat = function() {
    return {
        id: this.sessionId,
        url: this.url,
        question: this.question,
        scrapedData: this.scrapedData,
        aiResponse: this.aiResponse,
        timestamp: this.timestamp.toISOString()
    };
};

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session; 