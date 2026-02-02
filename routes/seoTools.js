const express = require('express');
const router = express.Router();
const { 
    keywordResearch, 
    domainKeywordsList, 
    domainPagesList, 
    domainBacklinkAnalysis, 
    keywordData, 
    domainAnalysis,
    getUserScrapedSites
} = require('../controllers/seoToolsController');
const { authenticateToken } = require('../middleware/auth');

router.post('/keyword-research', keywordResearch);
router.post('/domain-keywords', domainKeywordsList);
router.post('/domain-pages', domainPagesList);
router.post('/domain-backlinks', domainBacklinkAnalysis);
router.post('/keyword-data', keywordData);
router.post('/domain-analysis', domainAnalysis);
router.get('/scraped-sites', authenticateToken, getUserScrapedSites);

module.exports = router;
