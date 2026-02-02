const axios = require('axios');

// API endpoints
const ENDPOINTS = {
    KEYWORD_RESEARCH: 'https://8rh1fcwhfj.execute-api.us-east-1.amazonaws.com/default/kw_res_270125',
    DOMAIN_KEYWORDS: 'https://iygdoxeucl.execute-api.us-east-1.amazonaws.com/default/dk_data_270125',
    DOMAIN_PAGES: 'https://foos3c69y2.execute-api.us-east-1.amazonaws.com/default/pa_data_270125',
    DOMAIN_BACKLINKS: 'https://3n0tfetzhf.execute-api.us-east-1.amazonaws.com/default/bk_data_270125',
    KEYWORD_DATA: 'https://l3vm79uuof.execute-api.us-east-1.amazonaws.com/default/kw_data_270125',
    DOMAIN_ANALYSIS: 'https://i2cmfax6pg.execute-api.us-east-1.amazonaws.com/default/domain_an_res_270125'
};

// Default link constant
const DEFAULT_LINK = 'https://app.writecream.com';

/**
 * Make API request to external SEO tools
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request payload
 * @returns {Promise<Object>} API response
 */
const makeApiRequest = async (url, data) => {
    try {
        console.log(`Making API request to: ${url}`);
        console.log('Request data:', JSON.stringify(data, null, 2));
        
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 second timeout
        });
        
        console.log('API response status:', response.status);
        console.log('API response data:', JSON.stringify(response.data, null, 2));
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('API request failed:', error.message);
        
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return {
                success: false,
                error: `API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`,
                statusCode: error.response.status
            };
        } else if (error.request) {
            console.error('No response received:', error.request);
            return {
                success: false,
                error: 'Network Error: No response from API server'
            };
        } else {
            console.error('Request setup error:', error.message);
            return {
                success: false,
                error: `Request Error: ${error.message}`
            };
        }
    }
};

/**
 * Perform keyword research
 * @param {string} keyword - Keyword to research
 * @returns {Promise<Object>} Keyword research results
 */
const performKeywordResearch = async (keyword) => {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        return {
            success: false,
            error: 'Keyword is required and must be a non-empty string'
        };
    }

    const requestData = {
        keyword: keyword.trim(),
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.KEYWORD_RESEARCH, requestData);
};

/**
 * Fetch domain keywords
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} Domain keywords data
 */
const fetchDomainKeywords = async (domain) => {
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
        return {
            success: false,
            error: 'Domain is required and must be a non-empty string'
        };
    }

    // Clean domain (remove protocol, www, trailing slash)
    const cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

    const requestData = {
        domain: cleanDomain,
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.DOMAIN_KEYWORDS, requestData);
};

/**
 * Fetch domain pages
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} Domain pages data
 */
const fetchDomainPages = async (domain) => {
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
        return {
            success: false,
            error: 'Domain is required and must be a non-empty string'
        };
    }

    // Clean domain (remove protocol, www, trailing slash)
    const cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

    const requestData = {
        domain: cleanDomain,
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.DOMAIN_PAGES, requestData);
};

/**
 * Fetch domain backlinks
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} Domain backlinks data
 */
const fetchDomainBacklinks = async (domain) => {
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
        return {
            success: false,
            error: 'Domain is required and must be a non-empty string'
        };
    }

    // Clean domain (remove protocol, www, trailing slash)
    const cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

    const requestData = {
        domain: cleanDomain,
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.DOMAIN_BACKLINKS, requestData);
};

/**
 * Fetch keyword data
 * @param {string} keyword - Keyword to analyze
 * @returns {Promise<Object>} Keyword data
 */
const fetchKeywordData = async (keyword) => {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
        return {
            success: false,
            error: 'Keyword is required and must be a non-empty string'
        };
    }

    const requestData = {
        keyword: keyword.trim(),
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.KEYWORD_DATA, requestData);
};

/**
 * Analyze domain
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} Domain analysis results
 */
const analyzeDomain = async (domain) => {
    if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
        return {
            success: false,
            error: 'Domain is required and must be a non-empty string'
        };
    }

    // Clean domain (remove protocol, www, trailing slash)
    const cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');

    const requestData = {
        domain: cleanDomain,
        link: DEFAULT_LINK
    };

    return await makeApiRequest(ENDPOINTS.DOMAIN_ANALYSIS, requestData);
};

/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if valid domain format
 */
const isValidDomain = (domain) => {
    if (!domain || typeof domain !== 'string') return false;
    
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain.trim());
};

/**
 * Validate keyword format
 * @param {string} keyword - Keyword to validate
 * @returns {boolean} True if valid keyword format
 */
const isValidKeyword = (keyword) => {
    if (!keyword || typeof keyword !== 'string') return false;
    
    // Keywords should be 1-100 characters, alphanumeric with spaces and common symbols
    const keywordRegex = /^[a-zA-Z0-9\s\-_.,!?()]{1,100}$/;
    return keywordRegex.test(keyword.trim());
};

/**
 * Clean and normalize domain
 * @param {string} domain - Raw domain input
 * @returns {string} Cleaned domain
 */
const cleanDomain = (domain) => {
    if (!domain || typeof domain !== 'string') return '';
    
    return domain.trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .replace(/\/.*$/, ''); // Remove path
};

/**
 * Clean and normalize keyword
 * @param {string} keyword - Raw keyword input
 * @returns {string} Cleaned keyword
 */
const cleanKeyword = (keyword) => {
    if (!keyword || typeof keyword !== 'string') return '';
    
    return keyword.trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .substring(0, 100); // Limit to 100 characters
};

module.exports = {
    performKeywordResearch,
    fetchDomainKeywords,
    fetchDomainPages,
    fetchDomainBacklinks,
    fetchKeywordData,
    analyzeDomain,
    makeApiRequest,
    isValidDomain,
    isValidKeyword,
    cleanDomain,
    cleanKeyword,
    ENDPOINTS,
    DEFAULT_LINK
};

