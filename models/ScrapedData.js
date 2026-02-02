const mongoose = require('mongoose');

const ScrapedDataSchema = new mongoose.Schema({
    // Unique identifier (compatible with existing fileId system)
    fileId: {
        type: String,
        required: true,
        default: () => Date.now().toString()
    },
    
    // Website information
    url: {
        type: String,
        required: true,
        trim: true
    },
    
    title: {
        type: String,
        required: true,
        trim: true
    },
    
    description: {
        type: String,
        default: '',
        trim: true
    },
    
    // Scraped content - comprehensive data structure
    headings: [{
        level: {
            type: String,
            enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        },
        text: {
            type: String,
            required: true
        },
        id: String
    }],
    
    paragraphs: [{
        type: String
    }],
    
    links: [{
        url: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        title: String
    }],
    
    // Enhanced content types - using Mixed for flexible complex data
    lists: [mongoose.Schema.Types.Mixed],
    tables: [mongoose.Schema.Types.Mixed],
    images: [mongoose.Schema.Types.Mixed],
    divs: [mongoose.Schema.Types.Mixed],
    spans: [mongoose.Schema.Types.Mixed],
    forms: [mongoose.Schema.Types.Mixed],
    navigation: [mongoose.Schema.Types.Mixed],
    footer: [mongoose.Schema.Types.Mixed],
    header: [mongoose.Schema.Types.Mixed],
    allText: [mongoose.Schema.Types.Mixed],
    
    // Complete content extraction
    textContent: String,
    articles: [mongoose.Schema.Types.Mixed],
    sections: [mongoose.Schema.Types.Mixed],
    completeContent: String,
    rawHTML: mongoose.Schema.Types.Mixed,
    
    // New enhanced scraping fields
    scrapingMethod: {
        type: String,
        default: 'enhanced'
    },
    
    // Internal links found but not scraped
    storedInternalLinks: [{
        type: String
    }],
    
    internalLinksFound: {
        type: Number,
        default: 0
    },
    
    // Additional URLs that were actually scraped
    additionalUrls: [{
        url: String,
        source: String, // 'sitemap', 'internal links', etc.
        title: String,
        timestamp: Date
    }],
    
    totalUrlsScraped: {
        type: Number,
        default: 1
    },
    
    // Website theme data
    theme: {
        colors: {
            primary: String,
            secondary: String,
            accent: String,
            background: String,
            text: String,
            border: String,
            button: String,
            link: String
        },
        typography: {
            primaryFont: String,
            secondaryFont: String,
            headingFont: String,
            bodyFont: String,
            fontSize: String,
            fontWeight: String
        },
        layout: {
            borderRadius: String,
            spacing: mongoose.Schema.Types.Mixed,
            shadows: String
        },
        branding: {
            logoUrl: String,
            faviconUrl: String,
            brandName: String
        },
        extracted: {
            type: Boolean,
            default: false
        },
        timestamp: Date
    },
    
    // Metadata fields
    keywords: String,
    author: String,
    
    // File metadata (for backward compatibility)
    fileName: {
        type: String,
        required: true
    },
    
    // Enhanced scraping metadata
    scrapingMethod: {
        type: String,
        enum: ['enhanced'],
        default: 'enhanced'
    },
    
    additionalUrls: [{
        url: {
            type: String,
            required: true
        },
        source: {
            type: String,
            enum: ['sitemap.xml', 'robots.txt', 'internal links'],
            required: true
        },
        title: String,
        timestamp: Date
    }],
    
    totalUrlsScraped: {
        type: Number,
        default: 1
    },
    
    // Additional metadata
    metadata: {
        fileSize: {
            type: Number,
            default: 0
        },
        version: {
            type: String,
            default: '2.0.0'
        },
        scrapingMethod: {
            type: String,
            enum: ['enhanced'],
            default: 'enhanced'
        },
        note: {
            type: String,
            default: ''
        },
        error: {
            type: Boolean,
            default: false
        }
    },
    
    // User association (for API key filtering)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Timestamps
    savedAt: {
        type: Date,
        default: Date.now
    },
    
    scrapedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
ScrapedDataSchema.index({ url: 1 });
ScrapedDataSchema.index({ title: 'text', description: 'text' }); // Text search
ScrapedDataSchema.index({ savedAt: -1 }); // Sort by most recent
ScrapedDataSchema.index({ fileId: 1 }, { unique: true });
ScrapedDataSchema.index({ userId: 1 }); // Filter by user
ScrapedDataSchema.index({ userId: 1, savedAt: -1 }); // User files by date

// Virtual for display name (backward compatibility)
ScrapedDataSchema.virtual('displayName').get(function() {
    return this.title || this.fileName;
});

// Virtual for formatted file size
ScrapedDataSchema.virtual('formattedFileSize').get(function() {
    return this.formatFileSize(this.metadata.fileSize);
});

// Instance method to format file size
ScrapedDataSchema.methods.formatFileSize = function(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Static method to generate filename (like the old system)
ScrapedDataSchema.statics.generateFileName = function(customName, url) {
    let baseName;
    
    if (customName && customName.trim()) {
        baseName = customName.trim()
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, ' ')
            .slice(0, 50);
    } else {
        try {
            const urlObj = new URL(url);
            baseName = urlObj.hostname.replace('www.', '');
        } catch {
            baseName = 'website';
        }
    }
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    return `${baseName} ${date} ${time}.json`;
};

// Static method to create from scraped data (compatibility with old service)
ScrapedDataSchema.statics.createFromScrapedData = function(scrapedData) {
    const fileName = this.generateFileName(null, scrapedData.url);
    
    return new this({
        url: scrapedData.url,
        title: scrapedData.title || 'No title found',
        description: scrapedData.description || '',
        keywords: scrapedData.keywords || '',
        author: scrapedData.author || '',
        
        // Basic content
        headings: scrapedData.headings || [],
        paragraphs: scrapedData.paragraphs || [],
        links: scrapedData.links || [],
        
        // Enhanced content types
        lists: scrapedData.lists || [],
        tables: scrapedData.tables || [],
        images: scrapedData.images || [],
        divs: scrapedData.divs || [],
        spans: scrapedData.spans || [],
        forms: scrapedData.forms || [],
        navigation: scrapedData.navigation || [],
        footer: scrapedData.footer || [],
        header: scrapedData.header || [],
        allText: scrapedData.allText || [],
        
        // Complete content
        textContent: scrapedData.textContent || '',
        articles: scrapedData.articles || [],
        sections: scrapedData.sections || [],
        completeContent: scrapedData.completeContent || '',
        rawHTML: scrapedData.rawHTML || {},
        
        // Website theme data
        theme: scrapedData.theme || {},
        
        // Enhanced scraping metadata
        scrapingMethod: scrapedData.scrapingMethod || 'enhanced',
        additionalUrls: scrapedData.additionalUrls || [],
        totalUrlsScraped: scrapedData.totalUrlsScraped || 1,
        
        // File metadata
        fileName: fileName,
        metadata: {
            scrapingMethod: 'enhanced',
            note: scrapedData.note || '',
            error: scrapedData.error || false,
            version: '2.0.0' // Updated version for comprehensive scraping
        },
        scrapedAt: scrapedData.timestamp ? new Date(scrapedData.timestamp) : new Date()
    });
};

// Pre-save middleware to calculate file size
ScrapedDataSchema.pre('save', function(next) {
    if (this.isNew || this.isModified()) {
        // Calculate approximate file size based on ALL content including enhanced fields
        const jsonString = JSON.stringify({
            url: this.url,
            title: this.title,
            description: this.description,
            keywords: this.keywords,
            author: this.author,
            headings: this.headings,
            paragraphs: this.paragraphs,
            links: this.links,
            lists: this.lists,
            tables: this.tables,
            images: this.images,
            divs: this.divs,
            spans: this.spans,
            forms: this.forms,
            navigation: this.navigation,
            footer: this.footer,
            header: this.header,
            allText: this.allText,
            textContent: this.textContent,
            articles: this.articles,
            sections: this.sections,
            completeContent: this.completeContent,
            rawHTML: this.rawHTML,
            theme: this.theme,
            scrapingMethod: this.scrapingMethod,
            storedInternalLinks: this.storedInternalLinks,
            internalLinksFound: this.internalLinksFound,
            additionalUrls: this.additionalUrls,
            totalUrlsScraped: this.totalUrlsScraped
        });
        this.metadata.fileSize = Buffer.byteLength(jsonString, 'utf8');
    }
    next();
});

const ScrapedData = mongoose.model('ScrapedData', ScrapedDataSchema);

module.exports = ScrapedData;