const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrapeController');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { authenticateToken } = require('../middleware/auth');

// SDK Routes (require API key authentication)
// POST /api/scrape/save - Simple scrape and save (no AI processing)
router.post('/save', apiKeyAuth, scrapeController.scrapeAndSave);

// POST /api/scrape/chat - Chat with website content
router.post('/chat', apiKeyAuth, scrapeController.chatWithWebsite);

// GET /api/scrape/files - Get list of saved files (SDK access)
router.get('/files', apiKeyAuth, scrapeController.getHistory);

// GET /api/scrape/files/:id - Get specific file content (SDK access)
router.get('/files/:id', apiKeyAuth, scrapeController.getFileContent);

// GET /api/scrape/theme/:id - Get theme data for a specific website (SDK access)
router.get('/theme/:id', apiKeyAuth, scrapeController.getThemeData);

// GET /api/scrape/sdk-config - Get SDK configuration for API key holder (SDK access)
router.get('/sdk-config', apiKeyAuth, scrapeController.getSdkConfig);

// Dashboard Routes (require user authentication)
// POST /api/scrape/dashboard/save - Simple scrape and save for dashboard
router.post('/dashboard/save', authenticateToken, scrapeController.scrapeAndSave);

// POST /api/scrape/dashboard/chat - Chat with website content for dashboard
router.post('/dashboard/chat', authenticateToken, scrapeController.chatWithWebsite);

// POST /api/scrape/dashboard/integration-settings - Save integration settings
router.post('/dashboard/integration-settings', authenticateToken, scrapeController.saveIntegrationSettings);

// POST /api/scrape/url - Scrape a URL and get AI response
router.post('/url', authenticateToken, scrapeController.scrapeUrl);

// GET /api/scrape/dashboard/files - Get list of saved files (Dashboard access)
router.get('/dashboard/files', authenticateToken, scrapeController.getHistory);

// GET /api/scrape/dashboard/files/:id - Get specific file content (Dashboard access)
router.get('/dashboard/files/:id', authenticateToken, scrapeController.getFileContent);

// GET /api/scrape/dashboard/theme/:id - Get theme data for a specific website (Dashboard access)
router.get('/dashboard/theme/:id', authenticateToken, scrapeController.getThemeData);

// PUT /api/scrape/files/:id/rename - Rename a file
router.put('/files/:id/rename', authenticateToken, scrapeController.renameFile);

// DELETE /api/scrape/files/:id - Delete specific file
router.delete('/files/:id', authenticateToken, scrapeController.deleteHistory);

// GET /api/scrape/stats - Get storage statistics
router.get('/stats', authenticateToken, scrapeController.getStorageStats);

// Legacy routes for backward compatibility
router.get('/history', authenticateToken, scrapeController.getHistory);
router.delete('/history/:id', authenticateToken, scrapeController.deleteHistory);

module.exports = router;