const ScrapedData = require('../models/ScrapedData');
const database = require('../config/database');

class MongoStorageService {
    constructor() {
        // Database connection will be handled when needed
    }

    async ensureConnection() {
        try {
            if (database.getConnectionStatus() !== 'connected') {
                await database.connect();
            }
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            throw error;
        }
    }

    // Save scraped data to MongoDB (replaces saveScrapedData from FileStorageService)
    async saveScrapedData(scrapedData, userId) {
        try {
            await this.ensureConnection();
            
            // Create new document using the model's static method
            const document = ScrapedData.createFromScrapedData(scrapedData);
            
            // Associate with user
            document.userId = userId;
            
            // Save to MongoDB
            const savedDocument = await document.save();
            
            // Enhanced logging for scraping success
            console.log('\n🎯 ENHANCED SCRAPING OPERATION COMPLETED');
            console.log(`   📄 File: ${savedDocument.fileName}`);
            console.log(`   🌐 URL: ${savedDocument.url}`);
            console.log(`   📝 Title: ${savedDocument.title}`);
            console.log(`   🔧 Method: ${savedDocument.scrapingMethod}`);
            console.log(`   📊 Content: ${savedDocument.paragraphs.length} paragraphs, ${savedDocument.headings.length} headings, ${savedDocument.links.length} links`);
            console.log(`   🔗 URLs Scraped: ${savedDocument.totalUrlsScraped}`);
            if (savedDocument.additionalUrls && savedDocument.additionalUrls.length > 0) {
                console.log(`   📋 Additional Sources:`);
                savedDocument.additionalUrls.forEach((urlInfo, index) => {
                    console.log(`      ${index + 1}. ${urlInfo.source}: ${urlInfo.url}`);
                });
            }
            console.log(`   💾 Size: ${this.formatFileSize(savedDocument.metadata.fileSize)}`);
            console.log(`   🔗 ID: ${savedDocument.fileId}`);
            console.log(`   ⏱️  Saved: ${savedDocument.savedAt.toLocaleTimeString()}`);
            console.log('   ' + '─'.repeat(50));
            
            // Return in the same format as the old FileStorageService
            return {
                success: true,
                fileId: savedDocument.fileId,
                fileName: savedDocument.fileName,
                filePath: `mongodb://${savedDocument._id}`, // Virtual path for compatibility
                fileData: {
                    id: savedDocument.fileId,
                    fileName: savedDocument.fileName,
                    scrapedData: {
                        url: savedDocument.url,
                        title: savedDocument.title,
                        description: savedDocument.description,
                        headings: savedDocument.headings,
                        paragraphs: savedDocument.paragraphs,
                        links: savedDocument.links,
                        timestamp: savedDocument.scrapedAt
                    },
                    savedAt: savedDocument.savedAt,
                    metadata: savedDocument.metadata
                }
            };

        } catch (error) {
            console.error('Error saving scraped data to MongoDB:', error);
            
            // Handle duplicate key errors
            if (error.code === 11000) {
                throw new Error('Duplicate data - this content may have already been saved');
            }
            
            throw error;
        }
    }

    // Get list of all saved files (replaces getFilesList from FileStorageService)
    async getFilesList(userId = null, limit = 50) {
        try {
            await this.ensureConnection();
            
            // Build query filter
            const filter = userId ? { userId } : {};
            
            const documents = await ScrapedData
                .find(filter)
                .sort({ savedAt: -1 }) // Most recent first
                .limit(limit)
                .select('fileId fileName title url savedAt metadata scrapingMethod totalUrlsScraped additionalUrls displayName formattedFileSize theme')
                .lean();

            // Transform to match old FileStorageService format with enhanced data
            return documents.map(doc => ({
                id: doc.fileId,
                fileName: doc.fileName,
                displayName: doc.title || doc.fileName,
                url: doc.url,
                title: doc.title,
                scrapingMethod: doc.scrapingMethod,
                totalUrlsScraped: doc.totalUrlsScraped || 1,
                additionalUrls: doc.additionalUrls || [],
                savedAt: doc.savedAt.toISOString(),
                fileSize: this.formatFileSize(doc.metadata?.fileSize || 0),
                theme: doc.theme || null
            }));

        } catch (error) {
            console.error('Error getting files list from MongoDB:', error);
            throw error;
        }
    }

    // Get specific file content (replaces getFileContent from FileStorageService)
    async getFileContent(fileId, userId = null) {
        try {
            await this.ensureConnection();
            
            // Build query filter
            const filter = { fileId };
            if (userId) {
                filter.userId = userId;
            }
            
            const document = await ScrapedData.findOne(filter);
            
            if (!document) {
                throw new Error('File not found or access denied');
            }

            // Return in old format for compatibility with enhanced data
            return {
                id: document.fileId,
                fileName: document.fileName,
                scrapedData: {
                    url: document.url,
                    title: document.title,
                    description: document.description,
                    headings: document.headings,
                    paragraphs: document.paragraphs,
                    links: document.links,
                    lists: document.lists,
                    tables: document.tables,
                    images: document.images,
                    divs: document.divs,
                    spans: document.spans,
                    forms: document.forms,
                    navigation: document.navigation,
                    footer: document.footer,
                    header: document.header,
                    allText: document.allText,
                    textContent: document.textContent,
                    articles: document.articles,
                    sections: document.sections,
                    completeContent: document.completeContent,
                    rawHTML: document.rawHTML,
                    scrapingMethod: document.scrapingMethod,
                    additionalUrls: document.additionalUrls,
                    totalUrlsScraped: document.totalUrlsScraped,
                    timestamp: document.scrapedAt
                },
                savedAt: document.savedAt,
                metadata: document.metadata
            };

        } catch (error) {
            console.error('Error getting file content from MongoDB:', error);
            throw error;
        }
    }

    // Delete a file (replaces deleteFile from FileStorageService)
    async deleteFile(fileId, userId = null) {
        try {
            await this.ensureConnection();
            
            // Build query filter to ensure user can only delete their own files
            const filter = { fileId };
            if (userId) {
                filter.userId = userId;
            }
            
            const result = await ScrapedData.deleteOne(filter);
            
            if (result.deletedCount === 0) {
                throw new Error('File not found or access denied');
            }

            console.log(`🗑️ Deleted scraped data: ${fileId} (User: ${userId || 'system'})`);
            return { success: true, message: 'File deleted successfully' };

        } catch (error) {
            console.error('Error deleting file from MongoDB:', error);
            throw error;
        }
    }

    // Rename a file (replaces renameFile from FileStorageService)
    async renameFile(fileId, newCustomName, userId = null) {
        try {
            await this.ensureConnection();
            
            // Build query filter to ensure user can only rename their own files
            const filter = { fileId };
            if (userId) {
                filter.userId = userId;
            }
            
            const document = await ScrapedData.findOne(filter);
            
            if (!document) {
                throw new Error('File not found or access denied');
            }

            // Generate new filename
            const newFileName = ScrapedData.generateFileName(newCustomName, document.url);
            
            // Update the document
            document.fileName = newFileName;
            if (newCustomName) {
                document.title = newCustomName.trim();
            }
            
            await document.save();

            console.log(`📝 Renamed file ${fileId} to: ${newFileName} (User: ${userId || 'system'})`);
            
            return {
                success: true,
                newFileName: newFileName,
                newDisplayName: document.title
            };

        } catch (error) {
            console.error('Error renaming file in MongoDB:', error);
            throw error;
        }
    }

    // Get storage statistics (replaces getStorageStats from FileStorageService)
    async getStorageStats(userId = null) {
        try {
            await this.ensureConnection();
            
            // Build aggregation pipeline with optional user filter
            const pipeline = [];
            if (userId) {
                pipeline.push({ $match: { userId } });
            }
            
            pipeline.push({
                $group: {
                    _id: null,
                    totalFiles: { $sum: 1 },
                    totalSize: { $sum: '$metadata.fileSize' },
                    avgFileSize: { $avg: '$metadata.fileSize' },
                    oldestFile: { $min: '$savedAt' },
                    newestFile: { $max: '$savedAt' }
                }
            });
            
            // Get aggregated statistics
            const stats = await ScrapedData.aggregate(pipeline);

            const dbStats = await database.getStats();
            
            const result = stats[0] || {
                totalFiles: 0,
                totalSize: 0,
                avgFileSize: 0,
                oldestFile: null,
                newestFile: null
            };

            return {
                totalFiles: result.totalFiles,
                totalSize: this.formatFileSize(result.totalSize),
                averageFileSize: this.formatFileSize(result.avgFileSize || 0),
                oldestFile: result.oldestFile ? result.oldestFile.toISOString() : null,
                newestFile: result.newestFile ? result.newestFile.toISOString() : null,
                userSpecific: userId ? true : false,
                database: {
                    name: dbStats.database,
                    collections: dbStats.collections,
                    totalSize: dbStats.totalSize,
                    documents: dbStats.documents
                },
                storageLocation: 'MongoDB Atlas Cloud Database'
            };

        } catch (error) {
            console.error('Error getting storage stats from MongoDB:', error);
            throw error;
        }
    }

    // Search functionality (new feature enabled by MongoDB)
    async searchFiles(query, userId = null, limit = 20) {
        try {
            await this.ensureConnection();
            
            // Build base search filter
            const searchFilter = {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { url: { $regex: query, $options: 'i' } },
                    { 'paragraphs': { $regex: query, $options: 'i' } }
                ]
            };

            // Add user filter if provided
            if (userId) {
                searchFilter.userId = userId;
            }
            
            const searchResults = await ScrapedData
                .find(searchFilter)
                .sort({ savedAt: -1 })
                .limit(limit)
                .select('fileId fileName title url savedAt metadata')
                .lean();

            return searchResults.map(doc => ({
                id: doc.fileId,
                fileName: doc.fileName,
                displayName: doc.title || doc.fileName,
                url: doc.url,
                title: doc.title,
                savedAt: doc.savedAt.toISOString(),
                fileSize: this.formatFileSize(doc.metadata?.fileSize || 0)
            }));

        } catch (error) {
            console.error('Error searching files in MongoDB:', error);
            throw error;
        }
    }

    // Get files by URL (new feature)
    async getFilesByUrl(url, userId = null, limit = 10) {
        try {
            await this.ensureConnection();
            
            // Build query filter
            const filter = { url };
            if (userId) {
                filter.userId = userId;
            }
            
            const documents = await ScrapedData
                .find(filter)
                .sort({ savedAt: -1 })
                .limit(limit)
                .select('fileId fileName title savedAt metadata')
                .lean();

            return documents.map(doc => ({
                id: doc.fileId,
                fileName: doc.fileName,
                displayName: doc.title || doc.fileName,
                url: doc.url,
                title: doc.title,
                savedAt: doc.savedAt.toISOString(),
                fileSize: this.formatFileSize(doc.metadata?.fileSize || 0)
            }));

        } catch (error) {
            console.error('Error getting files by URL from MongoDB:', error);
            throw error;
        }
    }

    // Utility method to format file size
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Cleanup old files (new feature)
    async cleanupOldFiles(daysOld = 30, userId = null) {
        try {
            await this.ensureConnection();
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            // Build filter with optional user restriction
            const filter = { savedAt: { $lt: cutoffDate } };
            if (userId) {
                filter.userId = userId;
            }
            
            const result = await ScrapedData.deleteMany(filter);
            
            const userContext = userId ? ` for user ${userId}` : ' (system-wide)';
            console.log(`🧹 Cleaned up ${result.deletedCount} files older than ${daysOld} days${userContext}`);
            
            return {
                success: true,
                deletedCount: result.deletedCount,
                message: `Deleted ${result.deletedCount} files older than ${daysOld} days${userContext}`
            };

        } catch (error) {
            console.error('Error cleaning up old files:', error);
            throw error;
        }
    }

    // Get scraped data by ID (for theme data retrieval)
    async getScrapedDataById(id, userId = null) {
        try {
            await this.ensureConnection();
            
            // Build query filter
            const filter = { fileId: id };
            if (userId) {
                filter.userId = userId;
            }
            
            const document = await ScrapedData.findOne(filter);
            
            if (!document) {
                return null;
            }

            return document;

        } catch (error) {
            console.error('Error getting scraped data by ID:', error);
            throw error;
        }
    }
}

module.exports = new MongoStorageService();