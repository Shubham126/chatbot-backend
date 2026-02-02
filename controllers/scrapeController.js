const scrapingService = require('../services/scrapingService');
const openaiService = require('../services/openaiService');
const mongoStorageService = require('../services/mongoStorageService');
const contextBuilder = require('../services/contextBuilder');
const User = require('../models/User');

class ScrapeController {
    // Helper method to extract user ID from both authentication methods
    getUserId(req) {
        if (req.apiUser && req.apiUser._id) {
            return req.apiUser._id;
        }
        if (req.user && req.user._id) {
            return req.user._id;
        }
        return null;
    }

    // Helper method to get user data for email notifications
    async getUserData(req) {
        const userId = this.getUserId(req);
        if (!userId) return null;

        try {
            // If user data is already in req.apiUser or req.user, use it
            if (req.apiUser && req.apiUser.email) {
                return {
                    id: req.apiUser._id,
                    email: req.apiUser.email,
                    name: req.apiUser.name
                };
            }
            if (req.user && req.user.email) {
                return {
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.name
                };
            }

            // Otherwise, fetch from database
            const user = await User.findById(userId).select('email name');
            if (user) {
                return {
                    id: userId,
                    email: user.email,
                    name: user.name
                };
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }

        return null;
    }

    async scrapeAndSave(req, res, next) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required'
                });
            }

            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Get user data for email notifications
            const userData = await this.getUserData(req);
            console.log('📧 User data for notifications:', userData ? `${userData.name} <${userData.email}>` : 'Not available');

            // Scrape the website with user data for email notifications
            const scrapedData = await scrapingService.scrapeWebsite(url, {}, userData);
            
            // Save to MongoDB using the new mongo storage service
            const fileResult = await mongoStorageService.saveScrapedData(scrapedData, userId);

            res.json({
                success: true,
                message: `Website scraped and saved as "${fileResult.fileName}"`,
                data: {
                    fileId: fileResult.fileId,
                    fileName: fileResult.fileName,
                    displayName: scrapedData.title || fileResult.fileName,
                    scrapedData: {
                        title: scrapedData.title,
                        url: scrapedData.url,
                        timestamp: scrapedData.timestamp,
                        headingsCount: scrapedData.headings.length,
                        paragraphsCount: scrapedData.paragraphs.length,
                        linksCount: scrapedData.links.length
                    }
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async scrapeUrl(req, res, next) {
        try {
            const { url, question } = req.body;

            if (!url || !question) {
                return res.status(400).json({
                    success: false,
                    message: 'URL and question are required'
                });
            }

            // Get user data for email notifications (optional for this endpoint)
            const userData = await this.getUserData(req);
            
            // Scrape the website with user data for email notifications
            const scrapedData = await scrapingService.scrapeWebsite(url, {}, userData);
            
            // Build context from scraped data
            const context = contextBuilder.buildContext(scrapedData, question);
            
            // Get AI response
            const aiResponse = await openaiService.getResponse(context, question);
            
            // Note: Session storage removed as it's not needed for current functionality
            // All scraped data is now stored via mongoStorageService.saveScrapedData()

            res.json({
                success: true,
                data: {
                    response: aiResponse
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async getHistory(req, res, next) {
        try {
            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }
            
            const files = await mongoStorageService.getFilesList(userId);
            res.json({
                success: true,
                data: files
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteHistory(req, res, next) {
        try {
            const { id } = req.params;
            
            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }
            
            await mongoStorageService.deleteFile(id, userId);
            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getFileContent(req, res, next) {
        try {
            const { id } = req.params;
            
            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }
            
            const fileContent = await mongoStorageService.getFileContent(id, userId);
            res.json({
                success: true,
                data: fileContent
            });
        } catch (error) {
            next(error);
        }
    }

    async renameFile(req, res, next) {
        try {
            const { id } = req.params;
            const { customName } = req.body;
            
            if (!customName || !customName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Custom name is required'
                });
            }

            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            await mongoStorageService.renameFile(id, customName.trim(), userId);
            res.json({
                success: true,
                message: 'File renamed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getStorageStats(req, res, next) {
        try {
            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }
            
            const stats = await mongoStorageService.getStorageStats(userId);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async chatWithWebsite(req, res, next) {
        try {
            const { fileId, message } = req.body;

            if (!fileId || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'File ID and message are required'
                });
            }

            // Extract user ID from either authentication method
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Get the file content (filter by user)
            const fileContent = await mongoStorageService.getFileContent(fileId, userId);
            
            if (!fileContent) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found or access denied'
                });
            }

            // Build context from scraped data for Gemini AI
            const context = contextBuilder.buildContext(fileContent.scrapedData, message);
            
            // Get AI response using OpenRouter (same as dashboard)
            const aiResponse = await openaiService.getResponse(context, message);

            res.json({
                success: true,
                data: {
                    response: aiResponse,
                    websiteTitle: fileContent.scrapedData.title,
                    websiteUrl: fileContent.scrapedData.url
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async getThemeData(req, res, next) {
        try {
            const { id } = req.params;
            const userId = this.getUserId(req);
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Find the scraped data by ID and user
            const scrapedData = await mongoStorageService.getScrapedDataById(id, userId);
            
            if (!scrapedData) {
                return res.status(404).json({
                    success: false,
                    message: 'Website data not found'
                });
            }

            // Extract theme data
            const themeData = {
                extracted: scrapedData.theme?.extracted || false,
                colors: scrapedData.theme?.colors || null,
                typography: scrapedData.theme?.typography || null,
                layout: scrapedData.theme?.layout || null,
                branding: scrapedData.theme?.branding || null,
                websiteName: scrapedData.title || 'Unknown Website',
                websiteUrl: scrapedData.url || '',
                timestamp: scrapedData.theme?.timestamp || scrapedData.scrapedAt
            };

            // If no theme was extracted, provide default fallback
            if (!themeData.extracted || !themeData.colors) {
                themeData.colors = {
                    primary: '#007bff',
                    secondary: '#6c757d',
                    accent: '#007bff',
                    background: '#ffffff',
                    text: '#333333',
                    border: '#dee2e6',
                    button: '#007bff',
                    link: '#007bff'
                };
                themeData.fallback = true;
            }

            res.json({
                success: true,
                data: themeData,
                message: themeData.extracted ? 'Theme data retrieved successfully' : 'Using fallback theme data'
            });

        } catch (error) {
            console.error('Error in getThemeData:', error);
            next(error);
        }
    }

    async getSdkConfig(req, res, next) {
        try {
            // Extract user ID from API key authentication
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            // Get user settings
            const UserSettings = require('../models/UserSettings');
            const userSettings = await UserSettings.getOrCreateSettings(userId);

            // Get user's available websites
            const websites = await mongoStorageService.getFilesList(userId);
            
            // Build SDK configuration
            const sdkConfig = {
                user: {
                    id: userId,
                    hasWebsites: websites.length > 0
                },
                integration: {
                    selectedWebsiteId: userSettings.integrationSettings.selectedWebsiteId,
                    selectedWebsiteUrl: userSettings.integrationSettings.selectedWebsiteUrl,
                    themeChoice: userSettings.integrationSettings.themeChoice,
                    customizations: userSettings.integrationSettings.customizations
                },
                availableWebsites: websites,
                selectedWebsite: null
            };

            // If user has a selected website, get its details
            if (userSettings.integrationSettings.selectedWebsiteId) {
                const selectedWebsite = websites.find(site => 
                    site.id === userSettings.integrationSettings.selectedWebsiteId
                );
                if (selectedWebsite) {
                    sdkConfig.selectedWebsite = selectedWebsite;
                    
                    // If theme choice is website, get theme data
                    if (userSettings.integrationSettings.themeChoice === 'website') {
                        try {
                            const themeData = await mongoStorageService.getScrapedDataById(selectedWebsite.id, userId);
                            if (themeData && themeData.theme) {
                                sdkConfig.themeData = themeData.theme;
                            }
                        } catch (error) {
                            console.warn('Could not load theme data:', error);
                        }
                    }
                }
            }

            res.json({
                success: true,
                data: sdkConfig
            });

        } catch (error) {
            console.error('Error getting SDK config:', error);
            next(error);
        }
    }

    async saveIntegrationSettings(req, res, next) {
        try {
            const userId = this.getUserId(req);
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const { selectedWebsiteId, selectedWebsiteUrl, themeChoice, customizations } = req.body;

            // Validate required fields
            if (!selectedWebsiteId) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected website ID is required'
                });
            }

            if (!themeChoice || !['default', 'website'].includes(themeChoice)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid theme choice is required (default or website)'
                });
            }

            // Update user settings
            const UserSettings = require('../models/UserSettings');
            const settingsUpdate = {
                selectedWebsiteId,
                selectedWebsiteUrl,
                themeChoice
            };

            if (customizations) {
                settingsUpdate.customizations = customizations;
            }

            const updatedSettings = await UserSettings.updateIntegrationSettings(userId, settingsUpdate);

            res.json({
                success: true,
                data: updatedSettings.integrationSettings,
                message: 'Integration settings saved successfully'
            });

        } catch (error) {
            console.error('Error saving integration settings:', error);
            next(error);
        }
    }
}

const scrapeControllerInstance = new ScrapeController();

// Bind all methods to maintain 'this' context
const boundController = {
    scrapeAndSave: scrapeControllerInstance.scrapeAndSave.bind(scrapeControllerInstance),
    scrapeUrl: scrapeControllerInstance.scrapeUrl.bind(scrapeControllerInstance),
    getHistory: scrapeControllerInstance.getHistory.bind(scrapeControllerInstance),
    deleteHistory: scrapeControllerInstance.deleteHistory.bind(scrapeControllerInstance),
    getFileContent: scrapeControllerInstance.getFileContent.bind(scrapeControllerInstance),
    renameFile: scrapeControllerInstance.renameFile.bind(scrapeControllerInstance),
    getStorageStats: scrapeControllerInstance.getStorageStats.bind(scrapeControllerInstance),
    chatWithWebsite: scrapeControllerInstance.chatWithWebsite.bind(scrapeControllerInstance),
    getThemeData: scrapeControllerInstance.getThemeData.bind(scrapeControllerInstance),
    getSdkConfig: scrapeControllerInstance.getSdkConfig.bind(scrapeControllerInstance),
    saveIntegrationSettings: scrapeControllerInstance.saveIntegrationSettings.bind(scrapeControllerInstance)
};

module.exports = boundController;