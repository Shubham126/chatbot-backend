const { 
    performKeywordResearch,
    fetchDomainKeywords,
    fetchDomainPages,
    fetchDomainBacklinks,
    fetchKeywordData,
    analyzeDomain
} = require('../services/seoToolsService');
const ScrapedData = require('../models/ScrapedData');

/**
 * Keyword Research endpoint
 */
const keywordResearch = async (req, res, next) => {
    try {
        const { keyword } = req.body;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        
        const data = await performKeywordResearch(keyword);
        res.json(data);
    } catch (error) {
        console.error('Error in keyword research:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Domain Keywords List endpoint
 */
const domainKeywordsList = async (req, res, next) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        const data = await fetchDomainKeywords(domain);
        res.json(data);
    } catch (error) {
        console.error('Error in domain keywords list:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Domain Pages List endpoint
 */
const domainPagesList = async (req, res, next) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        const data = await fetchDomainPages(domain);
        res.json(data);
    } catch (error) {
        console.error('Error in domain pages list:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Domain Backlink Analysis endpoint
 */
const domainBacklinkAnalysis = async (req, res, next) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        const data = await fetchDomainBacklinks(domain);
        res.json(data);
    } catch (error) {
        console.error('Error in domain backlink analysis:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Keyword Data endpoint
 */
const keywordData = async (req, res, next) => {
    try {
        const { keyword } = req.body;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }
        
        const data = await fetchKeywordData(keyword);
        res.json(data);
    } catch (error) {
        console.error('Error in keyword data:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Domain Analysis endpoint
 */
const domainAnalysis = async (req, res, next) => {
    try {
        const { domain } = req.body;
        
        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' });
        }
        
        const data = await analyzeDomain(domain);
        res.json(data);
    } catch (error) {
        console.error('Error in domain analysis:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

/**
 * Get User's Scraped Sites endpoint
 */
const getUserScrapedSites = async (req, res, next) => {
    try {
        const { user } = req;
        
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const scrapedSites = await ScrapedData.find({ userId: user._id })
            .select('url title description savedAt')
            .sort({ savedAt: -1 })
            .limit(50); // Limit to most recent 50 sites
        
        res.json({
            success: true,
            data: scrapedSites.map(site => ({
                id: site._id,
                url: site.url,
                title: site.title,
                description: site.description,
                savedAt: site.savedAt,
                domain: new URL(site.url).hostname.replace('www.', '')
            }))
        });
    } catch (error) {
        console.error('Error fetching scraped sites:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

module.exports = {
    keywordResearch,
    domainKeywordsList,
    domainPagesList,
    domainBacklinkAnalysis,
    keywordData,
    domainAnalysis,
    getUserScrapedSites
};
