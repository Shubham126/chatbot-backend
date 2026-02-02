const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const emailService = require('./emailService');

class ScrapingService {
    constructor() {
        // Default configuration - no limits for comprehensive scraping
        this.config = {
            maxParagraphs: null, // null = no limit
            maxLinks: null, // null = no limit
            maxLists: null, // null = no limit
            maxTables: null, // null = no limit
            maxImages: null, // null = no limit
            minParagraphLength: 5, // Reduced to capture more content
            timeout: 30000, // Increased timeout for larger sites
            maxRedirects: 10, // Increased redirect allowance
            includeImages: true,
            includeTables: true,
            includeLists: true,
            includeArticles: true,
            includeSections: true,
            maxContextLength: null // No context length limit
        };
        this.scrapedUrls = new Set(); // Track scraped URLs to avoid duplicates
        this.mainUrl = null; // Track the main URL for theme extraction
    }

    // Method to update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Method to get current configuration
    getConfig() {
        return { ...this.config };
    }

    async scrapeWebsite(url, customConfig = {}, userData = null) {
        // Temporarily apply custom config if provided
        const originalConfig = { ...this.config };
        if (Object.keys(customConfig).length > 0) {
            this.updateConfig(customConfig);
        }

        try {
            // Reset scraped URLs for each new scraping session
            this.scrapedUrls.clear();
            
            console.log(`🚀 Starting enhanced scraping for: ${url}`);
            
            // ONLY use enhanced scraping algorithm - no fallbacks
            const result = await this.performEnhancedScrape(url);
            
            // Send success email notification if user data provided
            if (userData && userData.email) {
                try {
                    console.log(`📧 Sending success notification to: ${userData.email}`);
                    await this.sendSuccessNotification(userData, result);
                } catch (emailError) {
                    console.error('❌ Failed to send success email notification:', emailError.message);
                    // Don't throw - email failure shouldn't fail the scraping process
                }
            }
            
            return result;
        } catch (error) {
            console.error('Enhanced scraping failed:', error.message);
            
            // Send error email notification if user data provided
            if (userData && userData.email) {
                try {
                    console.log(`📧 Sending error notification to: ${userData.email}`);
                    await this.sendErrorNotification(userData, url, error);
                } catch (emailError) {
                    console.error('❌ Failed to send error email notification:', emailError.message);
                    // Don't throw - email failure shouldn't fail the scraping process
                }
            }
            
            throw error;
        } finally {
            // Restore original config
            this.config = originalConfig;
        }
    }

    async performEnhancedScrape(url) {
        try {
            const baseUrl = new URL(url);
            const domain = `${baseUrl.protocol}//${baseUrl.host}`;
            
            // Set the main URL for theme extraction
            this.mainUrl = url;
            
            console.log(`📋 Step 1: Scraping main URL: ${url}`);
            
            // Step 1: Always scrape the main URL first
            const mainScrapedData = await this.performScrape(url);
            this.scrapedUrls.add(url);
            
            // Step 2: Extract internal links from main page (but don't scrape them yet)
            const internalLinks = this.extractInternalLinks(mainScrapedData.links, domain);
            console.log(`🔗 Found ${internalLinks.length} internal links from main page`);
            
            // Initialize combined data with main URL data
            let combinedData = {
                ...mainScrapedData,
                scrapingMethod: 'enhanced',
                additionalUrls: [],
                totalUrlsScraped: 1,
                internalLinksFound: internalLinks.length,
                storedInternalLinks: internalLinks // Store internal links without scraping
            };
            
            console.log(`🗺️ Step 3: Checking for sitemap.xml with nested traversal`);
            
            // Step 3: Try to find and scrape sitemap.xml with nested support
            const sitemapUrls = await this.findAndScrapeSitemapNested(domain);
            
            if (sitemapUrls.length > 0) {
                console.log(`✅ Found ${sitemapUrls.length} URLs from sitemaps`);
                // Use sitemap URLs first, up to 50 successful scrapes
                console.log(`📊 Processing up to 50 URLs from sitemaps (${sitemapUrls.length} available)`);
                combinedData = await this.scrapeAdditionalUrls(combinedData, sitemapUrls, 'sitemap.xml', 50);
                
                // Check if we need more URLs to reach 50 total
                const currentScrapedCount = combinedData.totalUrlsScraped - 1; // Subtract 1 for main URL
                const remainingSlots = 50 - currentScrapedCount;
                
                if (remainingSlots > 0) {
                    // Try robots.txt first, then internal links
                    await this.fillRemainingSlots(combinedData, domain, internalLinks, remainingSlots);
                }
            } else {
                console.log(`⚠️ No sitemap URLs found, trying robots.txt`);
                
                // Step 4: Try robots.txt as fallback
                const robotsUrls = await this.findAndScrapeRobots(domain);
                
                if (robotsUrls.length > 0) {
                    console.log(`✅ Found ${robotsUrls.length} URLs from robots.txt`);
                    console.log(`📊 Processing up to 50 URLs from robots.txt (${robotsUrls.length} available)`);
                    combinedData = await this.scrapeAdditionalUrls(combinedData, robotsUrls, 'robots.txt', 50);
                    
                    // Check if we need more URLs to reach 50 total
                    const currentScrapedCount = combinedData.totalUrlsScraped - 1; // Subtract 1 for main URL
                    const remainingSlots = 50 - currentScrapedCount;
                    
                    if (remainingSlots > 0 && internalLinks.length > 0) {
                        console.log(`📈 Scraped ${currentScrapedCount} from robots.txt, need ${remainingSlots} more from internal links`);
                        
                        // Filter out internal links that are already scraped
                        const filteredInternalLinks = internalLinks.filter(link => 
                            !this.scrapedUrls.has(link)
                        );
                        
                        console.log(`📊 Processing up to ${remainingSlots} additional internal links`);
                        combinedData = await this.scrapeAdditionalUrls(combinedData, filteredInternalLinks, 'internal links', remainingSlots);
                    }
                } else {
                    console.log(`⚠️ No robots.txt URLs found, using internal links as final fallback`);
                    // Final fallback: Use internal links if no sitemaps or robots.txt URLs found
                    console.log(`📊 Processing up to 50 internal links as fallback (${internalLinks.length} available)`);
                    combinedData = await this.scrapeAdditionalUrls(combinedData, internalLinks, 'internal links', 50);
                }
            }
            
            console.log(`🎯 Enhanced scraping completed! Total URLs scraped: ${combinedData.totalUrlsScraped}`);
            return combinedData;
            
        } catch (error) {
            console.error('Enhanced scraping failed:', error.message);
            throw error;
        }
    }

    async findAndScrapeSitemapNested(domain, depth = 0, maxDepth = 3) {
        if (depth > maxDepth) {
            console.log(`⚠️ Max sitemap depth (${maxDepth}) reached`);
            return [];
        }
        
        const possibleSitemapUrls = [
            `${domain}/sitemap.xml`,
            `${domain}/sitemap_index.xml`,
            `${domain}/sitemap/index`
        ];
        
        let allUrls = [];
        
        for (const sitemapUrl of possibleSitemapUrls) {
            try {
                console.log(`🔍 Checking sitemap (depth ${depth}): ${sitemapUrl}`);
                const response = await axios.get(sitemapUrl, {
                    timeout: this.config.timeout,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.status === 200) {
                    console.log(`✅ Found sitemap: ${sitemapUrl}`);
                    const result = this.parseSitemapNested(response.data, domain);
                    
                    // Add regular URLs to our collection
                    allUrls.push(...result.urls);
                    
                    // If we found nested sitemaps and haven't reached max depth, process them
                    if (result.nestedSitemaps.length > 0 && depth < maxDepth) {
                        console.log(`🗂️ Found ${result.nestedSitemaps.length} nested sitemaps at depth ${depth}`);
                        
                        for (const nestedSitemapUrl of result.nestedSitemaps) {
                            try {
                                const nestedUrls = await this.processSingleSitemap(nestedSitemapUrl, domain, depth + 1, maxDepth);
                                allUrls.push(...nestedUrls);
                                
                                // Stop if we have enough URLs (50 limit)
                                if (allUrls.length >= 50) {
                                    console.log(`📊 Reached URL limit (50), stopping sitemap traversal`);
                                    break;
                                }
                            } catch (error) {
                                console.log(`⚠️ Failed to process nested sitemap ${nestedSitemapUrl}: ${error.message}`);
                                continue;
                            }
                        }
                    }
                    
                    // Stop if we found URLs from this sitemap
                    if (allUrls.length > 0) {
                        break;
                    }
                }
            } catch (error) {
                // Continue to next possible sitemap URL
                continue;
            }
        }
        
        // Remove duplicates and return unique URLs
        const uniqueUrls = [...new Set(allUrls)];
        console.log(`📊 Total unique URLs found from sitemaps: ${uniqueUrls.length}`);
        return uniqueUrls;
    }
    
    async processSingleSitemap(sitemapUrl, domain, depth, maxDepth) {
        if (depth > maxDepth) {
            return [];
        }
        
        try {
            console.log(`🔍 Processing nested sitemap (depth ${depth}): ${sitemapUrl}`);
            const response = await axios.get(sitemapUrl, {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.status === 200) {
                const result = this.parseSitemapNested(response.data, domain);
                let allUrls = [...result.urls];
                
                // Process any nested sitemaps found
                if (result.nestedSitemaps.length > 0 && depth < maxDepth) {
                    for (const nestedUrl of result.nestedSitemaps) {
                        const nestedUrls = await this.processSingleSitemap(nestedUrl, domain, depth + 1, maxDepth);
                        allUrls.push(...nestedUrls);
                        
                        // Stop if we have enough URLs
                        if (allUrls.length >= 50) {
                            break;
                        }
                    }
                }
                
                return allUrls;
            }
        } catch (error) {
            console.log(`⚠️ Failed to process sitemap ${sitemapUrl}: ${error.message}`);
        }
        
        return [];
    }
    
    parseSitemapNested(xmlData, domain) {
        const urls = [];
        const nestedSitemaps = [];
        const $ = cheerio.load(xmlData, { xmlMode: true });
        
        // Parse regular URLs from <url><loc> tags
        $('url loc').each((i, el) => {
            const url = $(el).text().trim();
            if (url && this.isValidUrl(url, domain)) {
                urls.push(url);
            }
        });
        
        // Parse nested sitemaps from <sitemap><loc> tags (sitemap index files)
        $('sitemap loc').each((i, el) => {
            const sitemapUrl = $(el).text().trim();
            if (sitemapUrl && sitemapUrl.includes('.xml')) {
                try {
                    const sitemapUrlObj = new URL(sitemapUrl);
                    const domainObj = new URL(domain);
                    
                    // Only process sitemaps from the same domain
                    if (sitemapUrlObj.host === domainObj.host) {
                        nestedSitemaps.push(sitemapUrl);
                        console.log(`🗂️ Found nested sitemap: ${sitemapUrl}`);
                    }
                } catch (error) {
                    // Skip invalid sitemap URLs - return early instead of continue
                    return;
                }
            }
        });
        
        console.log(`📊 Parsed sitemap: ${urls.length} URLs, ${nestedSitemaps.length} nested sitemaps`);
        
        return {
            urls: urls,
            nestedSitemaps: nestedSitemaps
        };
    }
    
    async findAndScrapeRobots(domain) {
        const robotsUrls = [];
        const robotsUrl = `${domain}/robots.txt`;
        
        try {
            console.log(`🔍 Checking: ${robotsUrl}`);
            const response = await axios.get(robotsUrl, {
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.status === 200) {
                console.log(`✅ Found robots.txt: ${robotsUrl}`);
                const robotsData = this.parseRobots(response.data, domain);
                
                // First, add regular Allow URLs from robots.txt
                robotsUrls.push(...robotsData.urls);
                console.log(`📋 Added ${robotsData.urls.length} Allow URLs from robots.txt`);
                
                // Then, process sitemap URLs found in robots.txt with nested scraping
                if (robotsData.sitemapUrls.length > 0 && robotsUrls.length < 50) {
                    console.log(`🗺️ Processing ${robotsData.sitemapUrls.length} sitemaps found in robots.txt`);
                    
                    for (const sitemapUrl of robotsData.sitemapUrls) {
                        try {
                            const sitemapUrls = await this.processSingleSitemap(sitemapUrl, domain, 0, 3);
                            robotsUrls.push(...sitemapUrls);
                            
                            // Stop if we have enough URLs
                            if (robotsUrls.length >= 50) {
                                console.log(`📊 Reached URL limit (50) from robots.txt sitemaps`);
                                break;
                            }
                        } catch (error) {
                            console.log(`⚠️ Failed to process sitemap from robots.txt ${sitemapUrl}: ${error.message}`);
                            continue;
                        }
                    }
                }
            }
        } catch (error) {
            // robots.txt not found or not accessible
            console.log(`❌ robots.txt not found or not accessible`);
        }
        
        return [...new Set(robotsUrls)]; // Remove duplicates
    }
    
    parseRobots(robotsData, domain) {
        const urls = [];
        const sitemapUrls = [];
        const lines = robotsData.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Extract Sitemap directives
            if (trimmedLine.toLowerCase().startsWith('sitemap:')) {
                const sitemapUrl = trimmedLine.substring(8).trim();
                if (sitemapUrl && sitemapUrl.includes('.xml')) {
                    try {
                        const sitemapUrlObj = new URL(sitemapUrl);
                        const domainObj = new URL(domain);
                        
                        // Only process sitemaps from the same domain
                        if (sitemapUrlObj.host === domainObj.host) {
                            sitemapUrls.push(sitemapUrl);
                            console.log(`🗂️ Found sitemap in robots.txt: ${sitemapUrl}`);
                        }
                    } catch (error) {
                        // Skip invalid sitemap URLs
                        continue;
                    }
                }
            }
            
            // Look for Allow directives (allowed paths)
            if (trimmedLine.toLowerCase().startsWith('allow:')) {
                const allowedPath = trimmedLine.substring(6).trim();
                if (allowedPath && allowedPath !== '/' && !allowedPath.includes('*')) {
                    const fullUrl = new URL(allowedPath, domain).toString();
                    if (this.isValidUrl(fullUrl, domain)) {
                        urls.push(fullUrl);
                    }
                }
            }
        }
        
        return { urls, sitemapUrls }; // Return both regular URLs and sitemap URLs
    }
    
    extractInternalLinks(links, domain) {
        const internalLinks = [];
        const domainObj = new URL(domain);
        
        for (const link of links) {
            try {
                const linkUrl = new URL(link.url);
                
                // Check if it's the same domain
                if (linkUrl.host === domainObj.host) {
                    // NO filtering - scrape everything found
                    internalLinks.push(link.url);
                }
            } catch (error) {
                // Skip invalid URLs - continue is valid in for...of loop
                continue;
            }
        }
        
        return [...new Set(internalLinks)]; // Remove duplicates but NO URL limits
    }
    
    async fillRemainingSlots(combinedData, domain, internalLinks, remainingSlots) {
        // Try robots.txt first
        console.log(`🤖 Checking robots.txt for additional URLs (need ${remainingSlots} more)`);
        const robotsUrls = await this.findAndScrapeRobots(domain);
        
        if (robotsUrls.length > 0) {
            console.log(`✅ Found ${robotsUrls.length} URLs from robots.txt`);
            
            // Filter out already scraped URLs
            const filteredRobotsUrls = robotsUrls.filter(url => !this.scrapedUrls.has(url));
            
            if (filteredRobotsUrls.length > 0) {
                console.log(`📊 Processing up to ${remainingSlots} URLs from robots.txt`);
                combinedData = await this.scrapeAdditionalUrls(combinedData, filteredRobotsUrls, 'robots.txt', remainingSlots);
                
                // Update remaining slots after robots.txt scraping
                const currentScrapedCount = combinedData.totalUrlsScraped - 1; // Subtract 1 for main URL
                remainingSlots = 50 - currentScrapedCount;
            }
        }
        
        // If still need more URLs, use internal links
        if (remainingSlots > 0 && internalLinks.length > 0) {
            console.log(`📈 Still need ${remainingSlots} more URLs, using internal links`);
            
            // Filter out internal links that are already scraped
            const filteredInternalLinks = internalLinks.filter(link => 
                !this.scrapedUrls.has(link)
            );
            
            if (filteredInternalLinks.length > 0) {
                console.log(`📊 Processing up to ${remainingSlots} additional internal links`);
                combinedData = await this.scrapeAdditionalUrls(combinedData, filteredInternalLinks, 'internal links', remainingSlots);
            }
        }
        
        return combinedData;
    }
    
    async scrapeAdditionalUrls(combinedData, urls, source, targetCount = 50) {
        console.log(`📥 Scraping up to ${targetCount} URLs from ${source} (${urls.length} URLs available)`);
        
        let successfulScrapes = 0;
        
        for (const url of urls) {
            // Stop if we've reached our target count
            if (successfulScrapes >= targetCount) {
                console.log(`✅ Reached target of ${targetCount} successful scrapes from ${source}`);
                break;
            }
            
            // Skip if already scraped
            if (this.scrapedUrls.has(url)) {
                continue;
            }
            
            try {
                console.log(`🔄 Scraping: ${url} (${successfulScrapes + 1}/${targetCount})`);
                const scrapedData = await this.performScrape(url);
                this.scrapedUrls.add(url);
                
                // Merge the scraped data
                combinedData = this.mergeScrapedData(combinedData, scrapedData, url, source);
                combinedData.totalUrlsScraped++;
                successfulScrapes++;
                
                // Add a small delay to be respectful
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`⚠️ Failed to scrape ${url}: ${error.message} (continuing to next URL)`);
                // Continue with next URL without incrementing successfulScrapes
                continue;
            }
        }
        
        console.log(`📊 Successfully scraped ${successfulScrapes} URLs from ${source}`);
        return combinedData;
    }
    
    mergeScrapedData(combinedData, newData, url, source) {
        // Add to additional URLs list
        combinedData.additionalUrls.push({
            url: url,
            source: source,
            title: newData.title,
            timestamp: newData.timestamp
        });
        
        // Merge all content arrays (excluding removed fields)
        combinedData.headings = [...combinedData.headings, ...newData.headings];
        combinedData.paragraphs = [...combinedData.paragraphs, ...newData.paragraphs];
        combinedData.lists = [...combinedData.lists, ...newData.lists];
        combinedData.tables = [...combinedData.tables, ...newData.tables];
        // combinedData.images = [...combinedData.images, ...newData.images]; // Removed to reduce data size
        combinedData.links = [...combinedData.links, ...newData.links];
        combinedData.articles = [...combinedData.articles, ...newData.articles];
        combinedData.sections = [...combinedData.sections, ...newData.sections];
        // combinedData.divs = [...combinedData.divs, ...newData.divs]; // Removed - creates massive redundant data
        combinedData.spans = [...combinedData.spans, ...newData.spans];
        combinedData.forms = [...combinedData.forms, ...newData.forms];
        // combinedData.navigation = [...combinedData.navigation, ...newData.navigation]; // Removed to reduce data size
        // combinedData.footer = [...combinedData.footer, ...newData.footer]; // Removed to reduce data size
        // combinedData.header = [...combinedData.header, ...newData.header]; // Removed to reduce data size
        // combinedData.allText = [...combinedData.allText, ...newData.allText]; // Removed - creates massive redundant data
        
        // Combine text content (excluding removed fields)
        // combinedData.textContent += ' ' + newData.textContent; // Removed - textContent field no longer exists
        // combinedData.completeContent += ' ' + newData.completeContent; // Removed to reduce data size
        // combinedData.allText += ' ' + newData.allText; // Removed - allText field no longer exists
        
        return combinedData;
    }
    
    isValidUrl(url, domain) {
        try {
            const urlObj = new URL(url);
            const domainObj = new URL(domain);
            
            // Must be same domain and use http/https
            return urlObj.host === domainObj.host && 
                   ['http:', 'https:'].includes(urlObj.protocol) &&
                   !this.scrapedUrls.has(url);
        } catch (error) {
            return false;
        }
    }

    // Extract theme from main URL only
    shouldExtractTheme(url) {
        // Only extract theme from main URL
        const shouldExtract = url === this.mainUrl;
        console.log('🎨 Theme extraction for', url, ':', shouldExtract ? 'ENABLED' : 'DISABLED');
        return shouldExtract;
        
        // Always extract from main URL
        if (url === this.mainUrl) {
            return true;
        }
        
        // Extract from important pages that likely contain brand colors
        const importantPagePatterns = [
            /\/(home|index|main)[\/?]?$/i,
            /\/(about|about-us|company)[\/?]?$/i,
            /\/(contact|contact-us)[\/?]?$/i,
            /\/(services|products)[\/?]?$/i,
            /\/$/  // Root pages
        ];
        
        return importantPagePatterns.some(pattern => pattern.test(url));
    }

    // Limit URLs according to new strategy: 1 main + 50 from sitemaps = 51 total
    limitUrls(urls, source) {
        let maxUrls = 50; // Allow up to 50 URLs from sitemaps
        
        if (urls.length <= maxUrls) {
            console.log(`📊 Processing all ${urls.length} URLs from ${source}`);
            return urls;
        } else {
            console.log(`📊 Processing first ${maxUrls} of ${urls.length} URLs from ${source} (limit: 50 for sitemaps)`);
            return urls.slice(0, maxUrls);
        }
    }

    async performScrape(url) {
        try {
            // Add rate limiting delay to prevent 429 errors
            await this.addRequestDelay();
            
            // Validate URL first
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Only HTTP and HTTPS URLs are supported');
            }

            // Prioritize theme extraction: Try with User-Agent first, fallback to minimal headers if blocked
            let response;
            try {
                // First attempt: Full headers for optimal theme extraction
                response = await axios.get(url, {
                    timeout: this.config.timeout,
                    maxRedirects: this.config.maxRedirects,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    },
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    }
                });
                console.log('✅ Using enhanced headers for optimal theme extraction');
            } catch (error) {
                // Handle rate limiting with exponential backoff
                if (error.response?.status === 429) {
                    console.log('⚠️ Rate limited (429), applying exponential backoff...');
                    await this.handleRateLimit();
                    // Retry the request
                    response = await axios.get(url, {
                        timeout: this.config.timeout,
                        maxRedirects: this.config.maxRedirects,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                        },
                        validateStatus: function (status) {
                            return status >= 200 && status < 400;
                        }
                    });
                }
                // Fallback: Minimal headers if site blocks enhanced headers
                else if (error.response?.status === 400 || error.response?.status === 403) {
                    console.log('⚠️ Enhanced headers blocked, retrying with minimal headers...');
                    response = await axios.get(url, {
                        timeout: this.config.timeout,
                        maxRedirects: this.config.maxRedirects,
                        headers: {},
                        validateStatus: function (status) {
                            return status >= 200 && status < 400;
                        }
                    });
                    console.log('✅ Using minimal headers as fallback');
                } else {
                    throw error; // Re-throw non-blocking errors
                }
            }

            const $ = cheerio.load(response.data);
            
            // Remove only truly unnecessary elements, keep more content
            $('script, style, .ad, .advertisement, .popup, .modal').remove();
            
            const scrapedData = {
                url,
                title: $('title').text().trim() || 'No title found',
                description: $('meta[name="description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                author: $('meta[name="author"]').attr('content') || '',
                headings: this.extractHeadings($),
                paragraphs: this.extractParagraphs($),
                lists: this.extractLists($),
                tables: this.extractTables($),
                // images: this.extractImages($, url), // Removed to reduce data size
                links: this.extractLinks($, url),
                // textContent: this.extractTextContent($), // Removed - creates massive duplicates
                articles: this.extractArticles($),
                sections: this.extractSections($),
                // divs: this.extractDivs($), // Removed - creates massive redundant data with innerHTML
                spans: this.extractSpans($),
                forms: this.extractForms($),
                // navigation: this.extractNavigation($), // Removed to reduce data size
                // footer: this.extractFooter($), // Removed to reduce data size
                // header: this.extractHeader($), // Removed to reduce data size
                // allText: this.extractAllText($), // Removed - creates massive redundant data with innerHTML
                // completeContent: this.extractCompleteContent($), // Removed to reduce data size
                // rawHTML: this.extractRawHTML($), // Removed to reduce data size
                theme: this.shouldExtractTheme(url) ? (() => {
                    console.log('🎨 Extracting website theme...');
                    return this.extractTheme($, response.data);
                })() : null,
                timestamp: new Date().toISOString()
            };

            return scrapedData;
        } catch (error) {
            console.error('Scraping Error:', error.message);
            
            // Provide more specific error messages
            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 403:
                        throw new Error(`Access forbidden (403): The website "${url}" is blocking our request. This website doesn't allow scraping.`);
                    case 404:
                        throw new Error(`Page not found (404): The URL "${url}" doesn't exist or has been moved.`);
                    case 429:
                        throw new Error(`Rate limited (429): Too many requests to "${url}". Please try again later.`);
                    case 500:
                        throw new Error(`Server error (500): The website "${url}" is experiencing issues.`);
                    default:
                        throw new Error(`HTTP ${status}: Unable to access "${url}". The website may be blocking requests or having issues.`);
                }
            } else if (error.code === 'ENOTFOUND') {
                throw new Error(`Website not found: Unable to connect to "${url}". Please check the URL is correct.`);
            } else if (error.code === 'ETIMEDOUT') {
                throw new Error(`Request timeout: The website "${url}" took too long to respond. Please try again.`);
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error(`Connection refused: Unable to connect to "${url}". The website may be down.`);
            } else {
                throw new Error(`Failed to scrape website: ${error.message}`);
            }
        }
    }



    extractHeadings($) {
        const headings = [];
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            const text = $(el).text().trim();
            if (text) {
                headings.push({
                    level: el.tagName.toLowerCase(),
                    text,
                    id: $(el).attr('id') || null
                });
            }
        });
        return headings;
    }

    extractParagraphs($) {
        const paragraphs = [];
        
        // Only extract from meaningful content elements to avoid duplicates
        $('p, article, section, main, .content, .article-content, .post-content, blockquote').each((i, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 20) { // Only meaningful content
                paragraphs.push(text);
            }
        });
        
        // Remove duplicates and limit to prevent massive arrays
        const uniqueParagraphs = [...new Set(paragraphs)].slice(0, 100);
        return uniqueParagraphs;
    }

    extractLists($) {
        const lists = [];
        $('ul, ol, dl').each((i, el) => { // Added dl (definition lists)
            const listItems = [];
            $(el).find('li, dt, dd').each((j, li) => { // Added dt, dd for definition lists
                const text = $(li).text().trim();
                if (text) {
                    listItems.push(text);
                }
            });
            if (listItems.length > 0) {
                lists.push({
                    type: el.tagName.toLowerCase(),
                    items: listItems
                });
            }
        });
        return lists; // No limits - return all lists
    }

    extractTables($) {
        const tables = [];
        $('table, .table, .data-table, [role="table"]').each((i, el) => {
            const table = {
                headers: [],
                rows: [],
                caption: $(el).find('caption').text().trim() || '',
                className: $(el).attr('class') || ''
            };
            
            // Extract headers with more comprehensive selectors
            $(el).find('thead tr th, thead tr td, tr:first-child th, tbody tr:first-child th').each((j, header) => {
                const text = $(header).text().trim();
                if (text) {
                    table.headers.push(text);
                }
            });
            
            // Extract ALL rows including nested tables
            $(el).find('tbody tr, tr').each((j, row) => {
                const rowData = [];
                $(row).find('td, th').each((k, cell) => {
                    const text = $(cell).text().trim();
                    const cellData = {
                        text: text,
                        colspan: $(cell).attr('colspan') || '1',
                        rowspan: $(cell).attr('rowspan') || '1'
                    };
                    rowData.push(cellData);
                });
                if (rowData.length > 0) {
                    table.rows.push(rowData);
                }
            });
            
            // Also capture div-based tables
            if ($(el).hasClass('table') || $(el).attr('role') === 'table') {
                const divRows = [];
                $(el).find('.row, [role="row"]').each((j, row) => {
                    const cellData = [];
                    $(row).find('.cell, [role="cell"], .column').each((k, cell) => {
                        const text = $(cell).text().trim();
                        if (text) {
                            cellData.push({ text: text, colspan: '1', rowspan: '1' });
                        }
                    });
                    if (cellData.length > 0) {
                        divRows.push(cellData);
                    }
                });
                if (divRows.length > 0) {
                    table.rows = table.rows.concat(divRows);
                }
            }
            
            if (table.headers.length > 0 || table.rows.length > 0) {
                tables.push(table);
            }
        });
        return tables; // No limits - return all tables
    }

    extractImages($, baseUrl) {
        const images = [];
        $('img, picture, figure, svg, video, iframe, embed, object').each((i, el) => {
            const tagName = el.tagName.toLowerCase();
            let src = '';
            let alt = '';
            let title = '';
            
            // Handle different media types
            if (tagName === 'img') {
                src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || '';
                alt = $(el).attr('alt') || '';
                title = $(el).attr('title') || '';
            } else if (tagName === 'video') {
                src = $(el).attr('src') || $(el).find('source').first().attr('src') || '';
                alt = 'Video content';
                title = $(el).attr('title') || '';
            } else if (tagName === 'iframe') {
                src = $(el).attr('src') || '';
                alt = 'Embedded content';
                title = $(el).attr('title') || 'Iframe content';
            } else if (tagName === 'svg') {
                alt = 'SVG graphic';
                title = $(el).attr('title') || $(el).find('title').text() || '';
                src = 'SVG inline graphic';
            }
            
            if (src || tagName === 'svg') {
                try {
                    const absoluteUrl = src ? new URL(src, baseUrl).toString() : src;
                    images.push({
                        type: tagName,
                        src: absoluteUrl,
                        alt,
                        title,
                        width: $(el).attr('width') || '',
                        height: $(el).attr('height') || ''
                    });
                } catch (error) {
                    // Include even if URL is invalid for SVG and other inline content
                    if (tagName === 'svg' || src) {
                        images.push({
                            type: tagName,
                            src: src,
                            alt,
                            title,
                            width: $(el).attr('width') || '',
                            height: $(el).attr('height') || ''
                        });
                    }
                }
            }
        });
        return images; // No limits - return all images and media
    }

    extractLinks($, baseUrl) {
        const links = [];
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            const title = $(el).attr('title') || '';
            
            if (href) { // Remove text requirement - capture all links even without text
                try {
                    const absoluteUrl = new URL(href, baseUrl).toString();
                    links.push({
                        url: absoluteUrl,
                        text: text || href, // Use href as text if no text content
                        title
                    });
                } catch (error) {
                    // Skip invalid URLs
                }
            }
        });
        return links; // No limits - return all links
    }

    extractTextContent($) {
        // Extract ALL text content from the entire page - everything visible and hidden
        let allContent = '';
        
        // Get ALL text from every single element
        $('*').each((i, el) => {
            const text = $(el).text();
            if (text && text.trim()) {
                allContent += text + ' ';
            }
        });
        
        // Also get text content from the entire HTML
        const bodyText = $('body').text();
        const headText = $('head').text();
        
        // Combine everything
        const combinedContent = (headText + ' ' + bodyText + ' ' + allContent)
            .replace(/\s+/g, ' ')
            .trim();
            
        return combinedContent;
    }

    extractArticles($) {
        const articles = [];
        $('article').each((i, el) => {
            const title = $(el).find('h1, h2, h3').first().text().trim();
            const content = $(el).text().trim();
            if (content) {
                articles.push({
                    title: title || `Article ${i + 1}`,
                    content
                });
            }
        });
        return articles;
    }

    extractSections($) {
        const sections = [];
        $('section').each((i, el) => {
            const heading = $(el).find('h1, h2, h3, h4, h5, h6').first().text().trim();
            const content = $(el).text().trim();
            if (content) {
                sections.push({
                    heading: heading || `Section ${i + 1}`,
                    content
                });
            }
        });
        return sections;
    }

    extractDivs($) {
        const divs = [];
        $('div').each((i, el) => {
            const content = $(el).text().trim();
            const directContent = $(el).clone().children().remove().end().text().trim();
            const className = $(el).attr('class') || '';
            const id = $(el).attr('id') || '';
            const innerHTML = $(el).html() || '';
            
            // Capture ALL divs, even empty ones for structure
            divs.push({
                content,
                directContent,
                className,
                id,
                index: i,
                innerHTML: innerHTML.substring(0, 1000) // More HTML context
            });
        });
        return divs;
    }

    extractSpans($) {
        const spans = [];
        $('span, em, strong, b, i, u, small, mark, del, ins, sub, sup, code, kbd, var, samp').each((i, el) => {
            const content = $(el).text().trim();
            const className = $(el).attr('class') || '';
            const id = $(el).attr('id') || '';
            const tagName = el.tagName.toLowerCase();
            
            // Capture ALL inline text elements
            if (content || className || id) {
                spans.push({
                    content,
                    className,
                    id,
                    tagName
                });
            }
        });
        return spans;
    }

    extractForms($) {
        const forms = [];
        $('form').each((i, el) => {
            const formData = {
                action: $(el).attr('action') || '',
                method: $(el).attr('method') || 'get',
                fields: []
            };
            
            $(el).find('input, textarea, select, button').each((j, field) => {
                const fieldData = {
                    type: $(field).attr('type') || field.tagName.toLowerCase(),
                    name: $(field).attr('name') || '',
                    placeholder: $(field).attr('placeholder') || '',
                    value: $(field).attr('value') || $(field).text().trim()
                };
                formData.fields.push(fieldData);
            });
            
            if (formData.fields.length > 0) {
                forms.push(formData);
            }
        });
        return forms;
    }

    extractNavigation($) {
        const navigation = [];
        $('nav, .nav, .navigation, .menu').each((i, el) => {
            const content = $(el).text().trim();
            const links = [];
            $(el).find('a').each((j, link) => {
                const href = $(link).attr('href');
                const text = $(link).text().trim();
                if (href && text) {
                    links.push({ href, text });
                }
            });
            if (content || links.length > 0) {
                navigation.push({
                    content,
                    links
                });
            }
        });
        return navigation;
    }

    extractFooter($) {
        const footers = [];
        $('footer, .footer').each((i, el) => {
            const content = $(el).text().trim();
            if (content) {
                footers.push({
                    content,
                    className: $(el).attr('class') || '',
                    id: $(el).attr('id') || ''
                });
            }
        });
        return footers;
    }

    extractHeader($) {
        const headers = [];
        $('header, .header').each((i, el) => {
            const content = $(el).text().trim();
            if (content) {
                headers.push({
                    content,
                    className: $(el).attr('class') || '',
                    id: $(el).attr('id') || ''
                });
            }
        });
        return headers;
    }

    extractAllText($) {
        // Extract EVERYTHING - all text from all elements without any restrictions
        const allTextElements = [];
        
        // Get absolutely every element with any text content
        $('*').each((i, el) => {
            const tagName = el.tagName.toLowerCase();
            const text = $(el).clone().children().remove().end().text().trim();
            const fullText = $(el).text().trim(); // Include nested text too
            const className = $(el).attr('class') || '';
            const id = $(el).attr('id') || '';
            const innerHTML = $(el).html() || '';
            
            // Capture EVERYTHING - no minimum length restrictions
            if (text || fullText) {
                allTextElements.push({
                    tagName,
                    directText: text,
                    fullText: fullText,
                    className,
                    id,
                    innerHTML: innerHTML.substring(0, 500) // Sample of HTML for context
                });
            }
        });
        
        return allTextElements;
    }

    extractCompleteContent($) {
        // Extract ABSOLUTELY EVERYTHING like the other scraper does
        let completeContent = '';
        
        // Get the entire page content including everything
        const fullBodyText = $('body').text();
        const fullHtmlText = $('html').text();
        
        // Combine everything into one massive content string
        completeContent = fullHtmlText.replace(/\s+/g, ' ').trim();
        
        // If content is still small, try alternative extraction
        if (completeContent.length < 10000) {
            let alternativeContent = '';
            $('*').each((i, el) => {
                const text = $(el).text();
                if (text && text.trim()) {
                    alternativeContent += text + ' ';
                }
            });
            completeContent = alternativeContent.replace(/\s+/g, ' ').trim();
        }
        
        return completeContent;
    }

    extractRawHTML($) {
        // Get raw HTML content for maximum data preservation
        const rawHTML = {
            head: $('head').html() || '',
            body: $('body').html() || '',
            fullHTML: $.html() || ''
        };
        
        // Also extract all script content that might contain data
        const scripts = [];
        $('script').each((i, el) => {
            const scriptContent = $(el).html() || '';
            const scriptSrc = $(el).attr('src') || '';
            if (scriptContent || scriptSrc) {
                scripts.push({
                    content: scriptContent.substring(0, 2000), // First 2000 chars
                    src: scriptSrc
                });
            }
        });
        
        rawHTML.scripts = scripts;
        
        return rawHTML;
    }

    extractTheme($, htmlContent) {
        try {
            console.log('🎨 Extracting website theme...');
            
            const theme = {
                colors: this.extractColors($, htmlContent),
                typography: this.extractTypography($),
                layout: this.extractLayout($),
                branding: this.extractBranding($),
                extracted: true,
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ Theme extracted:', theme);
            return theme;
        } catch (error) {
            console.error('❌ Theme extraction failed:', error);
            return this.getDefaultTheme();
        }
    }
    
    extractColors($, htmlContent) {
        console.log('🎨 Starting enhanced color extraction...');
        
        // Step 1: Analyze color frequency from the page
        const colorFrequency = this.analyzeColorFrequency($, htmlContent);
        console.log('📊 Color frequency analysis:', colorFrequency);
        
        // Step 2: Initialize colors object
        const colors = {
            primary: null,
            secondary: null,
            accent: null,
            background: null,
            text: null,
            border: null,
            button: null,
            link: null
        };
        
        // Step 3: Assign colors directly from frequency analysis
        if (colorFrequency && colorFrequency.length > 0) {
            // Primary: Most frequent, high-vibrance color
            const topColor = colorFrequency[0];
            if (topColor && topColor.vibrance > 50) {
                colors.primary = topColor.color;
                console.log('🎯 PRIMARY assigned from frequency:', colors.primary);
            }
            
            // Secondary: Second most frequent, distinct color
            if (colorFrequency.length > 1) {
                for (let i = 1; i < colorFrequency.length; i++) {
                    const candidate = colorFrequency[i];
                    if (candidate.vibrance > 30 && candidate.color !== colors.primary) {
                        colors.secondary = candidate.color;
                        console.log('🎨 SECONDARY assigned from frequency:', colors.secondary);
                        break;
                    }
                }
            }
            
            // Accent: Use primary if not set
            if (colors.primary) {
                colors.accent = colors.primary;
                colors.button = colors.primary;
                colors.link = colors.primary;
            }
        }
        
        // Step 4: Only normalize colors (no defaults)
        Object.keys(colors).forEach(key => {
            if (colors[key]) {
                colors[key] = this.normalizeColor(colors[key]);
            }
        });
        
        console.log('✅ Final extracted colors:', colors);
        return colors;
    }
    
    extractSemanticElementColors($, colors) {
        console.log('🔍 Extracting colors from semantic elements...');
        
        // Enhanced priority order for primary color detection
        const primarySelectors = [
            { selector: '.logo, .brand, .branding, #logo, #brand, .logo-container, .brand-container', priority: 1, properties: ['color', 'background-color'] },
            { selector: '.cta, .call-to-action, .btn-primary, .primary-button, .button-primary', priority: 2, properties: ['background-color'] },
            { selector: 'header, .header, .site-header, .main-header, .page-header', priority: 3, properties: ['background-color'] },
            { selector: 'nav, .nav, .navbar, .navigation, .main-nav, .primary-nav', priority: 4, properties: ['background-color'] },
            { selector: '.hero, .banner, .jumbotron, .intro, .hero-section, .main-banner', priority: 5, properties: ['background-color'] },
            { selector: 'button[type="submit"], .btn-submit, .submit-button', priority: 6, properties: ['background-color'] }
        ];
        
        // Extract primary color with enhanced priority and validation
        for (const { selector, priority, properties } of primarySelectors) {
            if (colors.primary) break;
            
            const elements = $(selector);
            if (elements.length > 0) {
                for (const property of properties) {
                    const color = this.extractColorFromElements(elements, property);
                    if (color && this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                        colors.primary = color;
                        console.log(`🎯 Primary color (priority ${priority}) from ${selector} (${property}):`, color);
                        break;
                    }
                }
                if (colors.primary) break;
            }
        }
    }
    
    analyzeColorFrequency($, htmlContent) {
        const colorCounts = new Map();
        const colorContexts = new Map(); // Track where colors are used
        
        // Extract colors from inline styles with context
        const styleRegex = /(?:color|background(?:-color)?|border(?:-color)?):\s*([^;]+)/gi;
        let match;
        while ((match = styleRegex.exec(htmlContent)) !== null) {
            const color = this.normalizeColor(match[1]);
            if (this.isValidBrandColor(color)) {
                const currentCount = colorCounts.get(color) || 0;
                colorCounts.set(color, currentCount + 1);
            }
        }
        
        // Extract colors from CSS hex values with higher weight for distinct colors
        const hexRegex = /#[0-9a-fA-F]{6}/g; // Only 6-digit hex for better quality
        while ((match = hexRegex.exec(htmlContent)) !== null) {
            const color = match[0].toLowerCase();
            if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                const currentCount = colorCounts.get(color) || 0;
                colorCounts.set(color, currentCount + 2); // Higher weight for hex colors
            }
        }
        
        // Sort by frequency and distinctiveness
        return Array.from(colorCounts.entries())
            .sort((a, b) => {
                // Prioritize by frequency first, then by color distinctiveness
                const freqDiff = b[1] - a[1];
                if (freqDiff !== 0) return freqDiff;
                
                // If frequencies are equal, prefer more vibrant colors
                return this.getColorVibrance(b[0]) - this.getColorVibrance(a[0]);
            })
            .slice(0, 15) // Get more candidates for better selection
            .map(([color, count]) => ({ color, count, vibrance: this.getColorVibrance(color) }));
    }

    isValidBrandColor(color) {
        if (!color) return false;
        
        const normalizedColor = color.toLowerCase().trim();
        
        // Remove common generic/system colors
        const genericColors = [
            '#ffffff', '#fff', 'white',
            '#000000', '#000', 'black', 
            '#333333', '#333',
            '#666666', '#666',
            '#999999', '#999',
            '#cccccc', '#ccc',
            '#f0f0f0', '#f5f5f5', '#fafafa',
            'transparent', 'inherit', 'initial', 'unset',
            // Common framework/library default colors
            '#007bff', '#0056b3', '#0d6efd', // Bootstrap blues
            '#dc3545', '#28a745', '#ffc107', // Bootstrap semantic colors
            '#17a2b8', '#6c757d', '#343a40', // Bootstrap grays
            '#667eea', '#764ba2', // Common gradient colors
        ];
        
        // Skip generic colors
        if (genericColors.includes(normalizedColor)) {
            return false;
        }
        
        // Skip very light/dark colors and grayscale
        if (this.isColorTooLight(normalizedColor) || 
            this.isColorTooDark(normalizedColor) || 
            this.isGrayscaleColor(normalizedColor)) {
            return false;
        }
        
        // Ensure sufficient saturation for brand colors
        const vibrance = this.getColorVibrance(normalizedColor);
        if (vibrance < 15) {
            return false;
        }
        
        return true;
    }

    extractCSSStylesheetColors($, htmlContent, colors) {
        console.log('🎨 Extracting colors from CSS stylesheets...');
        
        // Extract from <style> tags
        $('style').each((i, styleTag) => {
            const cssContent = $(styleTag).html() || '';
            this.parseCSSForBrandColors(cssContent, colors);
        });
        
        // Extract from linked stylesheets (if content is available)
        const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
        const cssLinks = htmlContent.match(cssLinkRegex) || [];
        console.log(`📄 Found ${cssLinks.length} stylesheet links`);
    }

    extractCSSVariables(htmlContent) {
        const cssVariables = {};
        const variableRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
        let match;
        
        while ((match = variableRegex.exec(htmlContent)) !== null) {
            const varName = match[1];
            const varValue = match[2].trim();
            
            if (this.isColorValue(varValue)) {
                cssVariables[varName] = this.normalizeColor(varValue);
            }
        }
        
        return cssVariables;
    }

    mapCSSVariablesToColors(cssVariables, colors) {
        const colorKeywords = {
            primary: ['primary', 'main', 'brand'],
            secondary: ['secondary', 'accent'],
            background: ['background', 'bg'],
            text: ['text', 'foreground', 'fg'],
            border: ['border', 'outline'],
            button: ['button', 'btn'],
            link: ['link', 'anchor']
        };
        
        Object.entries(cssVariables).forEach(([varName, varValue]) => {
            Object.entries(colorKeywords).forEach(([colorType, keywords]) => {
                if (keywords.some(keyword => varName.toLowerCase().includes(keyword))) {
                    if (!colors[colorType] && this.isValidBrandColor(varValue)) {
                        colors[colorType] = varValue;
                        console.log(`🔧 CSS Variable ${colorType}:`, varValue);
                    }
                }
            });
        });
    }

    extractDominantElementColors($, colors, colorFrequency) {
        console.log('🎨 Extracting dominant colors from key elements...');
        
        // Direct assignment - Netflix red should be primary
        if (colorFrequency && colorFrequency.length > 0) {
            colors.primary = colorFrequency[0].color;
            colors.secondary = colorFrequency.length > 1 ? colorFrequency[1].color : null;
            console.log('🎯 DIRECTLY SET PRIMARY:', colors.primary);
            console.log('🎨 DIRECTLY SET SECONDARY:', colors.secondary);
        }
    }

    extractBrandColors($, colors) {
        console.log('🏷️ Extracting brand colors...');
        console.log('🔍 Colors before brand extraction - Primary:', colors.primary);
        
        // DON'T override colors that are already set from frequency analysis
        if (colors.primary) {
            console.log('✅ Primary already set, skipping brand color extraction');
            return;
        }
        
        const brandSelectors = [
            '.logo, .brand, .branding',
            '.company-name, .site-title',
            '.header .logo, header .brand'
        ];
        
        brandSelectors.forEach(selector => {
            const elements = $(selector);
            if (elements.length > 0) {
                const color = this.extractColorFromElements(elements, 'color');
                const bgColor = this.extractColorFromElements(elements, 'background-color');
                
                if (color && this.isValidBrandColor(color) && !colors.primary) {
                    colors.primary = color;
                    console.log('🎯 Brand text color:', color);
                }
                
                if (bgColor && this.isValidBrandColor(bgColor) && !colors.primary) {
                    colors.primary = bgColor;
                    console.log('🎯 Brand background color:', bgColor);
                }
            }
        });
    }

    extractCSSClassColors($, htmlContent, colors) {
        console.log('🎨 Extracting colors from CSS classes...');
        
        // Look for semantic class names that might contain colors
        const semanticClasses = [
            'primary', 'secondary', 'accent', 'brand',
            'main-color', 'theme-color', 'company-color'
        ];
        
        semanticClasses.forEach(className => {
            const elements = $(`.${className}`);
            if (elements.length > 0) {
                const color = this.extractColorFromElements(elements, 'color');
                const bgColor = this.extractColorFromElements(elements, 'background-color');
                
                if (color && this.isValidBrandColor(color)) {
                    if (className.includes('primary') && !colors.primary) {
                        colors.primary = color;
                    } else if (className.includes('secondary') && !colors.secondary) {
                        colors.secondary = color;
                    }
                }
                
                if (bgColor && this.isValidBrandColor(bgColor)) {
                    if (className.includes('primary') && !colors.primary) {
                        colors.primary = bgColor;
                    } else if (className.includes('secondary') && !colors.secondary) {
                        colors.secondary = bgColor;
                    }
                }
            }
        });
    }

    validateAndNormalizeColors(colors) {
        console.log('🔍 VALIDATION - Colors before normalization:', JSON.stringify(colors));
        
        // NO DEFAULTS - Only use scraped colors
        // Set accent to primary if not set
        if (!colors.accent && colors.primary) {
            colors.accent = colors.primary;
        }
        if (!colors.button && colors.primary) {
            colors.button = colors.primary;
        }
        if (!colors.link && colors.primary) {
            colors.link = colors.primary;
        }
        
        // Normalize all colors to lowercase hex
        Object.keys(colors).forEach(key => {
            if (colors[key]) {
                colors[key] = this.normalizeColor(colors[key]);
            }
        });
        
        console.log('🔍 VALIDATION - Final colors (no defaults):', JSON.stringify(colors));
    }

    extractTypography($) {
        return {
            primaryFont: null,
            secondaryFont: null,
            headingFont: null,
            bodyFont: null,
            fontSize: null,
            fontWeight: null
        };
    }

    extractLayout($) {
        return {
            borderRadius: '4px',
            spacing: {
                small: '8px',
                medium: '16px',
                large: '24px'
            },
            shadows: '0 2px 4px rgba(0,0,0,0.1)'
        };
    }

    extractBranding($) {
        return {
            logoUrl: null,
            faviconUrl: null,
            brandName: null
        };
    }

    isDistinctColor(color) {
        // Simple distinctiveness check
        return this.getColorVibrance(color) > 10;
    }

    getColorVibrance(color) {
        if (!color || !color.startsWith('#')) return 0;
        
        const hex = color.slice(1);
        if (hex.length !== 6) return 0;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        return max === 0 ? 0 : ((max - min) / max) * 100;
    }

    isColorTooLight(color) {
        if (!color || !color.startsWith('#')) return false;
        
        const hex = color.slice(1);
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 240;
    }

    isColorTooDark(color) {
        if (!color || !color.startsWith('#')) return false;
        
        const hex = color.slice(1);
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 20;
    }

    isGrayscaleColor(color) {
        if (!color || !color.startsWith('#')) return false;
        
        const hex = color.slice(1);
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const diff = Math.max(r, g, b) - Math.min(r, g, b);
        return diff < 15;
    }

    isColorValue(value) {
        return /^(#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\()/.test(value.trim());
    }

    parseCSSForBrandColors(cssContent, colors) {
        // Look for color definitions in CSS
        const colorRegex = /(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g;
        const matches = cssContent.match(colorRegex) || [];
        
        matches.forEach(color => {
            const normalized = this.normalizeColor(color);
            if (this.isValidBrandColor(normalized)) {
                if (!colors.primary) {
                    colors.primary = normalized;
                } else if (!colors.secondary && normalized !== colors.primary) {
                    colors.secondary = normalized;
                }
            }
        });
    }

    extractFromHeaderElements($) {
        const colors = [];
        
        // Enhanced header selectors with higher specificity
        const headerSelectors = [
            'header', '.header', '#header',
            'nav', '.nav', '.navbar', '.navigation',
            '.top-bar', '.header-bar', '.main-header',
            '.site-header', '.page-header'
        ];
        
        console.log('🔍 Enhanced header extraction...');
        
        headerSelectors.forEach(selector => {
            const elements = $(selector);
            console.log(`📍 Header selector "${selector}": found ${elements.length} elements`);
            
            elements.each((i, elem) => {
                const $elem = $(elem);
                
                // Check inline styles
                const style = $elem.attr('style');
                if (style) {
                    const styleColors = this.extractColorsFromStyleAttribute(style);
                    colors.push(...styleColors);
                    console.log(`🎨 Header inline colors from ${selector}:`, styleColors);
                }
                
                // Check for data attributes that might contain colors
                const bgColor = $elem.attr('data-bg-color') || $elem.attr('data-background');
                if (bgColor) {
                    const normalized = this.normalizeColor(bgColor);
                    if (this.isValidBrandColor(normalized)) {
                        colors.push(normalized);
                        console.log('🎯 Header data-bg-color:', normalized);
                    }
                }
                
                // Look for nested elements with brand colors
                $elem.find('.logo, .brand, .site-title').each((j, nested) => {
                    const nestedStyle = $(nested).attr('style');
                    if (nestedStyle) {
                        const nestedColors = this.extractColorsFromStyleAttribute(nestedStyle);
                        colors.push(...nestedColors);
                        console.log(`🎨 Nested header colors:`, nestedColors);
                    }
                });
            });
        });
        
        return colors.filter(color => this.isValidBrandColor(color));
    }
    
    extractColorsFromStyleAttribute(styleAttr) {
        const colors = [];
        const colorMatches = styleAttr.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g);
        if (colorMatches) {
            colorMatches.forEach(color => {
                const normalized = this.normalizeColor(color);
                if (normalized) colors.push(normalized);
            });
        }
        return colors;
    }
    
    getWeightedColorFrequency(weightedColors) {
        const freq = {};
        weightedColors.forEach(({ color, weight }) => {
            freq[color] = (freq[color] || 0) + weight;
        });
        return freq;
    }
    
    extractFromCSS($) {
        const colors = [];
        
        // Look for CSS color properties in style tags
        $('style').each((i, elem) => {
            const cssText = $(elem).html();
            if (cssText) {
                console.log('🔍 Found CSS content:', cssText.substring(0, 200) + '...');
                const colorMatches = cssText.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g);
                if (colorMatches) {
                    console.log('🎨 CSS colors found:', colorMatches);
                    colors.push(...colorMatches.map(color => this.normalizeColor(color)));
                }
            }
        });
        
        // Store external stylesheets for potential fetching
        const externalStylesheets = [];
        $('link[rel="stylesheet"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href) {
                externalStylesheets.push(href);
                console.log('📄 External stylesheet found:', href);
            }
        });
        
        // Try to fetch and parse external stylesheets (limited to first 3 for performance)
        if (externalStylesheets.length > 0) {
            console.log(`🔗 Attempting to fetch ${Math.min(3, externalStylesheets.length)} external stylesheets...`);
            // Note: This will be handled asynchronously in a separate method
        }
        
        console.log('✅ CSS extraction result:', colors);
        return colors.filter(color => this.isValidBrandColor(color));
    }
    
    async fetchExternalCSS(stylesheetUrls, baseUrl) {
        const colors = [];
        const maxStylesheets = 3; // Limit to prevent performance issues
        
        for (let i = 0; i < Math.min(maxStylesheets, stylesheetUrls.length); i++) {
            const cssUrl = stylesheetUrls[i];
            try {
                // Convert relative URLs to absolute
                const absoluteUrl = new URL(cssUrl, baseUrl).toString();
                console.log(`📥 Fetching external CSS: ${absoluteUrl}`);
                
                const response = await axios.get(absoluteUrl, {
                    timeout: 10000, // 10 second timeout for CSS files
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                if (response.status === 200 && response.data) {
                    console.log(`✅ Successfully fetched CSS (${response.data.length} chars)`);
                    const cssColors = this.extractColorsFromCSS(response.data);
                    colors.push(...cssColors);
                    console.log(`🎨 Found ${cssColors.length} colors in external CSS`);
                }
                
            } catch (error) {
                console.log(`⚠️ Failed to fetch CSS ${cssUrl}: ${error.message}`);
                continue;
            }
        }
        
        return colors.filter(color => this.isValidBrandColor(color));
    }
    
    extractColorsFromCSS(cssContent) {
        const colors = [];
        
        // Extract all color values from CSS content
        const colorRegex = /(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\))/g;
        const matches = cssContent.match(colorRegex);
        
        if (matches) {
            matches.forEach(color => {
                const normalized = this.normalizeColor(color);
                if (normalized) {
                    colors.push(normalized);
                }
            });
        }
        
        // Also look for CSS custom properties (CSS variables)
        const customPropRegex = /--[\w-]+\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g;
        const customMatches = cssContent.match(customPropRegex);
        
        if (customMatches) {
            console.log('🔧 Found CSS custom properties:', customMatches);
            customMatches.forEach(match => {
                const colorMatch = match.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/);
                if (colorMatch) {
                    const normalized = this.normalizeColor(colorMatch[0]);
                    if (normalized) {
                        colors.push(normalized);
                    }
                }
            });
        }
        
        return colors;
    }
    
    extractFromInlineStyles($) {
        const colors = [];
        
        // Look for inline style colors
        $('[style*="color"], [style*="background"]').each((i, elem) => {
            const style = $(elem).attr('style');
            if (style) {
                const colorMatches = style.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g);
                if (colorMatches) {
                    colors.push(...colorMatches.map(color => this.normalizeColor(color)));
                }
            }
        });
        
        return colors.filter(color => this.isValidBrandColor(color));
    }
    
    extractFromBrandElements($) {
        const colors = [];
        
        // Look for colors in common brand elements
        const brandSelectors = [
            'header', '.header', '#header',
            'nav', '.nav', '.navbar', 
            '.logo', '#logo',
            '.brand', '.branding',
            'button', '.button', '.btn',
            'a', '.link',
            '.primary', '.secondary', '.accent',
            // Add more specific selectors for major sites
            '[class*="brand"]', '[class*="primary"]', '[class*="accent"]',
            '[style*="background"]', '[style*="color"]'
        ];
        
        console.log('🔍 Searching for brand elements...');
        
        brandSelectors.forEach(selector => {
            const elements = $(selector);
            console.log(`📍 Found ${elements.length} elements for selector: ${selector}`);
            
            elements.each((i, elem) => {
                const $elem = $(elem);
                const style = $elem.attr('style');
                
                if (style) {
                    console.log(`🎨 Element style: ${style}`);
                    const colorMatches = style.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g);
                    if (colorMatches) {
                        console.log('🎯 Colors found in style:', colorMatches);
                        colors.push(...colorMatches.map(color => this.normalizeColor(color)));
                    }
                }
                
                // Try to get computed styles (though this might not work in server-side parsing)
                const className = $elem.attr('class');
                if (className) {
                    console.log(`📝 Element classes: ${className}`);
                }
            });
        });
        
        // Also scan all elements with style attributes
        const styledElements = $('[style]');
        console.log(`🔍 Found ${styledElements.length} elements with inline styles`);
        
        styledElements.each((i, elem) => {
            if (i < 10) { // Limit logging to first 10
                const style = $(elem).attr('style');
                console.log(`🎨 Inline style ${i}: ${style}`);
                
                const colorMatches = style.match(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g);
                if (colorMatches) {
                    console.log('🎯 Colors found:', colorMatches);
                    colors.push(...colorMatches.map(color => this.normalizeColor(color)));
                }
            }
        });
        
        console.log('✅ Brand elements extraction result:', colors);
        return colors.filter(color => this.isValidBrandColor(color));
    }
    
    normalizeColor(color) {
        // Convert rgb/rgba to hex
        if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const r = parseInt(matches[0]);
                const g = parseInt(matches[1]);
                const b = parseInt(matches[2]);
                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            }
        }
        
        // Convert 3-digit hex to 6-digit
        if (color.match(/^#[0-9a-fA-F]{3}$/)) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        
        return color.toLowerCase();
    }
    
    isValidBrandColor(color) {
        if (!color || !color.startsWith('#') || color.length !== 7) return false;
        
        // Exclude common non-brand colors
        const excludeColors = [
            '#000000', '#ffffff', '#fff', '#000',
            '#f0f0f0', '#f5f5f5', '#fafafa',
            '#e5e5e5', '#ddd', '#ccc', '#999',
            '#333333', '#666666', '#777777'
        ];
        
        if (excludeColors.includes(color)) return false;
        
        // Check if color has enough saturation (not grayscale)
        const hex = color.slice(1);
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        return saturation > 0.2; // At least 20% saturation
    }
    
    getColorFrequency(colors) {
        const freq = {};
        colors.forEach(color => {
            freq[color] = (freq[color] || 0) + 1;
        });
        return freq;
    }
    
    generateFallbackColor() {
        const url = this.mainUrl || 'default';
        const urlHash = this.hashCode(url);
        const hue = Math.abs(urlHash) % 360;
        return this.hslToHex(hue, 70, 50);
    }
    
    adjustColor(color, adjustment) {
        if (!color || !color.startsWith('#')) return color;
        
        const hex = color.slice(1);
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const factor = adjustment > 0 ? (255 - Math.max(r, g, b)) * (adjustment / 100) : Math.min(r, g, b) * (Math.abs(adjustment) / 100);
        
        const newR = Math.max(0, Math.min(255, adjustment > 0 ? r + factor : r - factor));
        const newG = Math.max(0, Math.min(255, adjustment > 0 ? g + factor : g - factor));
        const newB = Math.max(0, Math.min(255, adjustment > 0 ? b + factor : b - factor));
        
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // Email notification methods
    async sendSuccessNotification(userData, scrapingResult) {
        try {
            const notificationData = {
                url: scrapingResult.url,
                title: scrapingResult.title,
                timestamp: scrapingResult.timestamp,
                totalUrlsScraped: scrapingResult.totalUrlsScraped,
                headingsCount: scrapingResult.headings ? scrapingResult.headings.length : 0,
                paragraphsCount: scrapingResult.paragraphs ? scrapingResult.paragraphs.length : 0,
                linksCount: scrapingResult.links ? scrapingResult.links.length : 0,
                listsCount: scrapingResult.lists ? scrapingResult.lists.length : 0,
                tablesCount: scrapingResult.tables ? scrapingResult.tables.length : 0,
                articlesCount: scrapingResult.articles ? scrapingResult.articles.length : 0,
                sectionsCount: scrapingResult.sections ? scrapingResult.sections.length : 0,
                scrapingMethod: scrapingResult.scrapingMethod || 'enhanced',
                theme: scrapingResult.theme
            };

            await emailService.sendScrapingCompleteNotification(
                userData.email,
                userData.name,
                notificationData
            );

            console.log(`✅ Success notification sent to ${userData.email}`);
        } catch (error) {
            console.error('❌ Error sending success notification:', error.message);
            throw error;
        }
    }

    async sendErrorNotification(userData, url, error) {
        try {
            const errorData = {
                url: url,
                error: error.message,
                timestamp: new Date().toISOString()
            };

            await emailService.sendErrorNotification(
                userData.email,
                userData.name,
                errorData
            );

            console.log(`✅ Error notification sent to ${userData.email}`);
        } catch (emailError) {
            console.error('❌ Error sending error notification:', emailError.message);
            throw emailError;
        }
    }
    
    async addRequestDelay() {
        // More aggressive delay between requests to prevent rate limiting
        const delay = Math.random() * 3000 + 2000; // 2-5 seconds random delay
        console.log(`⏳ Request delay: waiting ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    async handleRateLimit() {
        // Much longer exponential backoff for rate limiting
        const backoffDelay = Math.random() * 15000 + 10000; // 10-25 seconds
        console.log(`⏳ Rate limit backoff: waiting ${Math.round(backoffDelay)}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
    
    extractCSSStylesheetColors($, htmlContent, colors) {
        console.log('🎨 Extracting colors from CSS stylesheets...');
        
        // Extract from <style> tags
        $('style').each((i, styleTag) => {
            const cssContent = $(styleTag).html() || '';
            this.parseCSSForBrandColors(cssContent, colors);
        });
        
        // Extract from linked stylesheets (if content is available)
        const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
        const cssLinks = htmlContent.match(cssLinkRegex) || [];
        console.log(`📄 Found ${cssLinks.length} stylesheet links`);
    }
    
    parseCSSForBrandColors(cssContent, colors) {
        // Generic brand color extraction - look for common semantic patterns
        const brandSelectors = [
            // Core structural elements
            'header', '.header', 'nav', '.nav', '.navbar',
            // Brand and identity elements
            '.brand', '.logo', '.branding',
            // Primary UI elements
            '.primary', 'button', '.button', '.btn',
            // Call-to-action elements
            '.cta', '.call-to-action',
            // Hero/banner sections
            '.hero', '.banner'
        ];
        
        // Extract all colors from CSS with frequency analysis
        const allColors = this.extractAllCSSColors(cssContent);
        
        // Analyze which colors appear in important contexts
        brandSelectors.forEach(selector => {
            const bgRegex = new RegExp(`\\${selector}\\s*\\{[^}]*background(?:-color)?\\s*:\\s*([^;]+)`, 'gi');
            const colorRegex = new RegExp(`\\${selector}\\s*\\{[^}]*(?:^|;)\\s*color\\s*:\\s*([^;]+)`, 'gi');
            
            let match;
            while ((match = bgRegex.exec(cssContent)) !== null) {
                const color = this.normalizeColor(match[1]);
                if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                    // Score colors based on element importance and frequency
                    const importance = this.getElementImportance(selector);
                    const frequency = allColors[color] || 0;
                    const score = importance * (frequency + 1);
                    
                    if (!colors.primary || score > (colors.primaryScore || 0)) {
                        colors.primary = color;
                        colors.primaryScore = score;
                        console.log(`🎯 Primary color candidate from ${selector}: ${color} (score: ${score})`);
                    }
                }
            }
            
            while ((match = colorRegex.exec(cssContent)) !== null) {
                const color = this.normalizeColor(match[1]);
                if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                    const importance = this.getElementImportance(selector);
                    const frequency = allColors[color] || 0;
                    const score = importance * (frequency + 1);
                    
                    if (!colors.primary || score > (colors.primaryScore || 0)) {
                        colors.primary = color;
                        colors.primaryScore = score;
                        console.log(`🎯 Primary color candidate from ${selector} (text): ${color} (score: ${score})`);
                    }
                }
            }
        });
    }
    
    extractSemanticElementColors($, colors) {
        console.log('🔍 Extracting colors from semantic elements...');
        
        // Generic priority order for primary color detection
        const primarySelectors = [
            { selector: '.logo, .brand, .branding, #logo, #brand', priority: 10, properties: ['color', 'background-color'] },
            { selector: '.primary, .btn-primary, .button-primary', priority: 8, properties: ['background-color', 'color'] },
            { selector: '.cta, .call-to-action', priority: 7, properties: ['background-color'] },
            { selector: 'header, .header', priority: 6, properties: ['background-color'] },
            { selector: 'nav, .nav, .navbar', priority: 5, properties: ['background-color'] },
            { selector: '.hero, .banner', priority: 4, properties: ['background-color'] },
            { selector: 'button, .button, .btn', priority: 3, properties: ['background-color'] }
        ];
        
        // Extract primary color with scoring system
        let bestScore = 0;
        for (const { selector, priority, properties } of primarySelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                for (const property of properties) {
                    const color = this.extractColorFromElements(elements, property);
                    if (color && this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                        // Calculate score based on priority, element count, and color vibrance
                        const elementCount = elements.length;
                        const vibrance = this.getColorVibrance(color);
                        const score = priority * elementCount * (vibrance / 100);
                        
                        if (score > bestScore) {
                            colors.primary = color;
                            bestScore = score;
                            console.log(`🎯 Primary color candidate from ${selector} (${property}): ${color} (score: ${score})`);
                        }
                    }
                }
            }
        }
        
        // Extract secondary color from complementary elements
        if (!colors.secondary) {
            const secondarySelectors = [
                '.secondary, .btn-secondary, .secondary-button',
                'aside, .sidebar, .aside',
                'footer, .footer, .site-footer'
            ];
            
            for (const selector of secondarySelectors) {
                const elements = $(selector);
                const color = this.extractColorFromElements(elements, 'background-color');
                if (color && this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                    colors.secondary = color;
                    console.log(`🎨 Secondary color from ${selector}:`, color);
                    break;
                }
            }
        }
        
        // Extract button colors with enhanced validation
        if (!colors.button) {
            const buttonSelectors = [
                'button, .button, .btn, input[type="submit"], .cta',
                '.action-button, .primary-action, .main-button'
            ];
            
            for (const selector of buttonSelectors) {
                const buttonElements = $(selector);
                const buttonColor = this.extractColorFromElements(buttonElements, 'background-color');
                if (buttonColor && this.isValidBrandColor(buttonColor)) {
                    colors.button = buttonColor;
                    if (!colors.accent) colors.accent = buttonColor;
                    console.log('🔘 Button color detected:', buttonColor);
                    break;
                }
            }
        }
        
        // Extract link colors with better filtering
        if (!colors.link) {
            const linkElements = $('a').not('.logo, .brand, .button, .btn');
            const linkColor = this.extractColorFromElements(linkElements, 'color');
            if (linkColor && this.isValidBrandColor(linkColor)) {
                colors.link = linkColor;
                console.log('🔗 Link color detected:', linkColor);
            }
        }
        
        // Extract background and text colors
        if (!colors.background) {
            const bgColor = this.extractColorFromElements($('body'), 'background-color');
            if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
                colors.background = bgColor;
                console.log('🎨 Background color detected:', bgColor);
            }
        }
        
        if (!colors.text) {
            const textSelectors = ['body, p, .content, .main-content, article'];
            for (const selector of textSelectors) {
                const textColor = this.extractColorFromElements($(selector), 'color');
                if (textColor && textColor !== colors.background) {
                    colors.text = textColor;
                    console.log('📝 Text color detected:', textColor);
                    break;
                }
            }
        }
    }
    
    extractColorFromElements(elements, property) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements.eq(i);
            const style = element.attr('style') || '';
            
            const match = style.match(new RegExp(property.replace('-', '\\-') + ':\\s*([^;]+)', 'i'));
            if (match) {
                const color = this.normalizeColor(match[1].trim());
                if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                    return color;
                }
            }
        }
        return null;
    }

    analyzeColorFrequency($, htmlContent) {
        const colorCounts = new Map();
        const colorContexts = new Map(); // Track where colors are used
        
        // Extract colors from inline styles with context
        const styleRegex = /(?:color|background(?:-color)?|border(?:-color)?):\s*([^;]+)/gi;
        let match;
        while ((match = styleRegex.exec(htmlContent)) !== null) {
            const color = this.normalizeColor(match[1]);
            if (this.isValidBrandColor(color)) {
                const currentCount = colorCounts.get(color) || 0;
                colorCounts.set(color, currentCount + 1);
                
                // Track context (where this color appears)
                if (!colorContexts.has(color)) {
                    colorContexts.set(color, []);
                }
            }
        }
        
        // Extract colors from CSS hex values with higher weight for distinct colors
        const hexRegex = /#[0-9a-fA-F]{6}/g; // Only 6-digit hex for better quality
        while ((match = hexRegex.exec(htmlContent)) !== null) {
            const color = match[0].toLowerCase();
            if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                const currentCount = colorCounts.get(color) || 0;
                colorCounts.set(color, currentCount + 2); // Higher weight for hex colors
            }
        }
        
        // Extract colors from rgb/rgba values
        const rgbRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/g;
        while ((match = rgbRegex.exec(htmlContent)) !== null) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const color = this.rgbToHex(r, g, b);
            
            if (this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                const currentCount = colorCounts.get(color) || 0;
                colorCounts.set(color, currentCount + 1);
            }
        }
        
        // Sort by frequency and distinctiveness
        return Array.from(colorCounts.entries())
            .sort((a, b) => {
                // Prioritize by frequency first, then by color distinctiveness
                const freqDiff = b[1] - a[1];
                if (freqDiff !== 0) return freqDiff;
                
                // If frequencies are equal, prefer more vibrant colors
                return this.getColorVibrance(b[0]) - this.getColorVibrance(a[0]);
            })
            .slice(0, 15) // Get more candidates for better selection
            .map(([color, count]) => ({ color, count, vibrance: this.getColorVibrance(color) }));
    }
    
    extractDominantElementColors($, colors, colorFrequency) {
        console.log('🎨 Extracting dominant colors from key elements...');
        
        // Generic high-priority elements for color extraction
        const priorityElements = [
            { selector: '.logo, .brand, #logo, #brand', weight: 10, properties: ['color', 'background-color'] },
            { selector: '.primary, .btn-primary, .button-primary', weight: 8, properties: ['background-color', 'color'] },
            { selector: 'header, .header', weight: 7, properties: ['background-color'] },
            { selector: '.cta, .call-to-action', weight: 6, properties: ['background-color'] },
            { selector: 'nav, .nav, .navbar', weight: 5, properties: ['background-color'] },
            { selector: '.hero, .banner', weight: 4, properties: ['background-color'] },
            { selector: 'button, .button, .btn', weight: 3, properties: ['background-color'] }
        ];
        
        // Extract primary color with weighted scoring
        let bestScore = 0;
        for (const { selector, weight, properties } of priorityElements) {
            const elements = $(selector);
            if (elements.length > 0) {
                for (const property of properties) {
                    const color = this.extractColorFromElements(elements, property);
                    if (color && this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                        const elementCount = elements.length;
                        const vibrance = this.getColorVibrance(color);
                        const score = weight * elementCount * (vibrance / 100);
                        
                        if (score > bestScore) {
                            colors.primary = color;
                            bestScore = score;
                            console.log(`🎯 Primary color candidate from ${selector} (${property}): ${color} (score: ${score})`);
                        }
                    }
                }
            }
        }
        
        // Extract secondary color from complementary elements
        if (!colors.secondary) {
            const secondarySelectors = [
                '.secondary, .btn-secondary, .secondary-button',
                'aside, .sidebar, .aside',
                'footer, .footer, .site-footer'
            ];
            
            for (const selector of secondarySelectors) {
                const elements = $(selector);
                const color = this.extractColorFromElements(elements, 'background-color');
                if (color && this.isValidBrandColor(color) && this.isDistinctColor(color)) {
                    colors.secondary = color;
                    console.log(`🎨 Secondary color from ${selector}:`, color);
                    break;
                }
            }
        }
        
        // Extract button colors with enhanced validation
        if (!colors.button) {
            const buttonSelectors = [
                'button, .button, .btn, input[type="submit"], .cta',
                '.action-button, .primary-action, .main-button'
            ];
            
            for (const selector of buttonSelectors) {
                const buttonElements = $(selector);
                const buttonColor = this.extractColorFromElements(buttonElements, 'background-color');
                if (buttonColor && this.isValidBrandColor(buttonColor)) {
                    colors.button = buttonColor;
                    if (!colors.accent) colors.accent = buttonColor;
                    console.log('🔘 Button color detected:', buttonColor);
                    break;
                }
            }
        }
        
        // Extract link colors with better filtering
        if (!colors.link) {
            const linkElements = $('a').not('.logo, .brand, .button, .btn');
            const linkColor = this.extractColorFromElements(linkElements, 'color');
            if (linkColor && this.isValidBrandColor(linkColor)) {
                colors.link = linkColor;
                console.log('🔗 Link color detected:', linkColor);
            }
        }
        
        // Extract background and text colors
        if (!colors.background) {
            const bgColor = this.extractColorFromElements($('body'), 'background-color');
            if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
                colors.background = bgColor;
                console.log('🎨 Background color detected:', bgColor);
            }
        }
        
        if (!colors.text) {
            const textSelectors = ['body, p, .content, .main-content, article'];
            for (const selector of textSelectors) {
                const textColor = this.extractColorFromElements($(selector), 'color');
                if (textColor && textColor !== colors.background) {
                    colors.text = textColor;
                    console.log('📝 Text color detected:', textColor);
                    break;
                }
            }
        }
    }
    
    isColorSimilar(color1, color2, threshold = 30) {
        if (!color1 || !color2) return false;
        
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        if (hex1.length !== 6 || hex2.length !== 6) return false;
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const distance = Math.sqrt(
            Math.pow(r2 - r1, 2) + 
            Math.pow(g2 - g1, 2) + 
            Math.pow(b2 - b1, 2)
        );
        
        return distance < threshold;
    }
    
    isDistinctColor(color) {
        if (!color) return false;
        
        // Check if color is distinct enough to be a brand color
        const normalizedColor = this.normalizeColor(color);
        if (!normalizedColor) return false;
        
        // Exclude very light colors (too close to white)
        const hex = normalizedColor.slice(1);
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Check if color is too light (close to white)
        const brightness = (r + g + b) / 3;
        if (brightness > 240) return false;
        
        // Check if color is too dark (close to black)
        if (brightness < 15) return false;
        
        // Check for sufficient color distinction (not too gray)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const colorRange = max - min;
        
        return colorRange > 20; // Sufficient color distinction
    }
    
    isValidBrandColor(color) {
        if (!color || typeof color !== 'string') return false;
        
        const normalizedColor = color.toLowerCase().trim();
        
        // Exclude transparent and invalid colors
        if (normalizedColor === 'transparent' || 
            normalizedColor === 'inherit' || 
            normalizedColor === 'initial' || 
            normalizedColor === 'unset' ||
            normalizedColor === 'none') {
            return false;
        }
        
        // Only exclude truly generic colors - be more permissive for brand colors
        const excludeColors = [
            '#ffffff', '#fff', 'white',
            '#000000', '#000', 'black',
            'rgba(0,0,0,0)', 'rgba(255,255,255,0)'
        ];
        
        if (excludeColors.includes(normalizedColor)) {
            return false;
        }
        
        // Check if it's a valid hex color format
        if (normalizedColor.startsWith('#')) {
            const hex = normalizedColor.slice(1);
            if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) {
                return false;
            }
        }
        
        // Use enhanced validation for better brand color detection
        return this.isEnhancedValidBrandColor(color);
    }
    
    isEnhancedValidBrandColor(color, vibrance = null) {
        if (!color) return false;
        
        const normalizedColor = color.toLowerCase().trim();
        
        // Only exclude truly unusable colors
        const trulyGenericColors = [
            '#ffffff', '#fff', 'white',
            '#000000', '#000', 'black', 
            'transparent', 'inherit', 'initial', 'unset',
            'rgba(0,0,0,0)', 'rgba(255,255,255,0)'
        ];
        
        if (trulyGenericColors.includes(normalizedColor)) {
            return false;
        }
        
        // Convert to hex for analysis
        const hexColor = this.normalizeColor(color);
        if (!hexColor || !hexColor.startsWith('#')) return false;
        
        // Check color properties
        const colorProps = this.getColorProperties(hexColor);
        
        // More permissive validation - allow muted brand colors
        // Exclude only very light grays and extremely unsaturated colors
        if (colorProps.saturation < 0.1 && colorProps.lightness > 0.9) {
            return false; // Very light gray
        }
        
        if (colorProps.saturation < 0.05 && colorProps.lightness > 0.8) {
            return false; // Light unsaturated color
        }
        
        return true;
    }
    
    getColorProperties(hexColor) {
        if (!hexColor || !hexColor.startsWith('#')) return null;
        
        const hex = hexColor.slice(1);
        if (hex.length !== 6) return null;
        
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        // Calculate HSL values
        const lightness = (max + min) / 2;
        const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
        
        let hue = 0;
        if (delta !== 0) {
            if (max === r) hue = ((g - b) / delta) % 6;
            else if (max === g) hue = (b - r) / delta + 2;
            else hue = (r - g) / delta + 4;
            hue *= 60;
            if (hue < 0) hue += 360;
        }
        
        return { hue, saturation, lightness, vibrance: saturation * (1 - Math.abs(2 * lightness - 1)) };
    }
    
    calculateVisualWeight($, element, color) {
        // Calculate visual importance based on element properties
        let weight = 1;
        
        // Element type importance
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const tagWeights = {
            'header': 8, 'nav': 7, 'main': 6, 'section': 4,
            'button': 5, 'a': 3, 'div': 2, 'span': 1
        };
        weight *= (tagWeights[tagName] || 1);
        
        // Class-based importance
        const className = $(element).attr('class') || '';
        const classPatterns = [
            { pattern: /logo|brand/i, weight: 10 },
            { pattern: /primary|main/i, weight: 8 },
            { pattern: /cta|call.to.action/i, weight: 7 },
            { pattern: /header|nav/i, weight: 6 },
            { pattern: /hero|banner/i, weight: 5 },
            { pattern: /button|btn/i, weight: 4 }
        ];
        
        for (const { pattern, weight: classWeight } of classPatterns) {
            if (pattern.test(className)) {
                weight *= classWeight;
                break;
            }
        }
        
        // Position importance (elements higher up are more important)
        try {
            const position = $(element).offset();
            if (position && position.top < 500) { // Above the fold
                weight *= 1.5;
            }
        } catch (e) {
            // Ignore positioning errors
        }
        
        return weight;
    }
    
    extractColorsByVisualWeight($, colors) {
        console.log('⚖️ Extracting colors by visual weight...');
        
        const colorScores = new Map();
        
        // Analyze all elements with background colors
        $('*').each((i, element) => {
            const $element = $(element);
            const bgColor = $element.css('background-color');
            const textColor = $element.css('color');
            
            [bgColor, textColor].forEach(color => {
                if (color && this.isEnhancedValidBrandColor(color)) {
                    const normalizedColor = this.normalizeColor(color);
                    if (normalizedColor) {
                        const visualWeight = this.calculateVisualWeight($, element, normalizedColor);
                        const currentScore = colorScores.get(normalizedColor) || 0;
                        colorScores.set(normalizedColor, currentScore + visualWeight);
                    }
                }
            });
        });
        
        // Sort colors by visual weight score
        const sortedColors = Array.from(colorScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Assign colors based on visual weight
        if (sortedColors.length > 0 && !colors.primary) {
            colors.primary = sortedColors[0][0];
            console.log(`🎯 Primary color by visual weight: ${colors.primary} (score: ${sortedColors[0][1]})`);
        }
        
        if (sortedColors.length > 1 && !colors.secondary) {
            colors.secondary = sortedColors[1][0];
            console.log(`🎨 Secondary color by visual weight: ${colors.secondary} (score: ${sortedColors[1][1]})`);
        }
        
        return sortedColors;
    }
    
    isStrictGrayscale(color) {
        const hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Only exclude if RGB values are very close (strict grayscale)
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        return maxDiff < 10; // Reduced from 20 to 10 - more lenient
    }
    
    extractCSSClassColors($, htmlContent, colors) {
        // Only look for explicit brand-related class names, avoid color assumptions
        const brandOnlyPatterns = ['primary', 'brand', 'main', 'theme'];
        
        brandOnlyPatterns.forEach(pattern => {
            if (colors.primary) return; // Stop if we already found primary
            
            const className = `.${pattern}`;
            const elements = $(className);
            if (elements.length > 0) {
                elements.each((i, el) => {
                    const $el = $(el);
                    const style = $el.attr('style') || '';
                    
                    const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/i);
                    if (bgMatch) {
                        const color = this.normalizeColor(bgMatch[1]);
                        if (this.isEnhancedValidBrandColor(color)) {
                            colors.primary = color;
                            console.log(`🎯 Found brand color from .${pattern}: ${color}`);
                            return false; // Break out of each
                        }
                    }
                });
            }
        });
    }
    
    getColorVibrance(hexColor) {
        // Calculate color vibrance (how "colorful" vs gray it is)
        const hex = hexColor.replace('#', '');
        if (hex.length !== 6) return 0;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate saturation as a measure of vibrance
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
        
        // Factor in brightness - very bright or very dark colors are less vibrant
        const brightness = (r + g + b) / 3;
        const brightnessFactor = brightness > 200 || brightness < 50 ? 0.5 : 1;
        
        return saturation * brightnessFactor;
    }
    
    isColorTooLight(color) {
        const hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r + g + b) / 3;
        return brightness > 240; // Very light colors
    }
    
    isColorTooDark(color) {
        const hex = color.replace('#', '');
        if (hex.length !== 6) return false;
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const brightness = (r + g + b) / 3;
        return brightness < 15; // Very dark colors
    }
    
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    extractCSSVariables(htmlContent) {
        console.log('🔍 Extracting CSS custom properties (variables)...');
        const cssVariables = {};
        
        // Extract CSS variables from :root and other selectors
        const variableRegex = /--([\w-]+)\s*:\s*([^;\n}]+)/g;
        let match;
        
        while ((match = variableRegex.exec(htmlContent)) !== null) {
            const varName = match[1].toLowerCase();
            const varValue = this.normalizeColor(match[2].trim());
            
            if (this.isValidBrandColor(varValue)) {
                cssVariables[varName] = varValue;
                console.log(`📝 CSS Variable found: --${varName}: ${varValue}`);
                
                // Special handling for brand-related variables
                if (varName.includes('brand') || varName.includes('primary') || varName.includes('theme')) {
                    console.log(`🎯 Potential brand variable detected: --${varName}: ${varValue}`);
                }
            }
        }
        
        // Look for common brand patterns in variable names
        const brandPatterns = ['brand', 'primary', 'accent', 'theme', 'main'];
        Object.keys(cssVariables).forEach(varName => {
            if (brandPatterns.some(pattern => varName.includes(pattern))) {
                console.log(`🎨 Brand variable detected: --${varName}: ${cssVariables[varName]}`);
            }
        });
        
        return cssVariables;
    }

    mapCSSVariablesToColors(cssVariables, colors) {
        // Common CSS variable naming patterns
        const colorMappings = {
            primary: ['primary', 'brand', 'main', 'theme'],
            secondary: ['secondary', 'accent-2', 'alt'],
            accent: ['accent', 'highlight', 'focus'],
            background: ['background', 'bg', 'surface'],
            text: ['text', 'foreground', 'content'],
            border: ['border', 'outline', 'divider'],
            button: ['button', 'btn', 'cta'],
            link: ['link', 'anchor']
        };

        Object.entries(colorMappings).forEach(([colorType, patterns]) => {
            patterns.forEach(pattern => {
                Object.keys(cssVariables).forEach(variable => {
                    if (variable.toLowerCase().includes(pattern) && 
                        this.isValidColor(cssVariables[variable])) {
                        if (!colors[colorType]) {
                            colors[colorType] = cssVariables[variable];
                        }
                    }
                });
            });
        });
    }

    extractInlineStyleColors($, colors) {
        // Extract from common elements with inline styles
        const elementsWithStyles = $('[style*="color"], [style*="background"]');
        
        elementsWithStyles.each((i, el) => {
            const style = $(el).attr('style') || '';
            
            // Extract background colors
            const bgMatch = style.match(/background(?:-color)?:\s*([^;]+)/i);
            if (bgMatch && this.isValidColor(bgMatch[1])) {
                if (!colors.background && $(el).is('body, html, .container, .wrapper')) {
                    colors.background = bgMatch[1].trim();
                }
                if (!colors.primary && $(el).is('header, .header, .navbar, .nav')) {
                    colors.primary = bgMatch[1].trim();
                }
            }
            
            // Extract text colors
            const colorMatch = style.match(/color:\s*([^;]+)/i);
            if (colorMatch && this.isValidColor(colorMatch[1])) {
                if (!colors.text && $(el).is('body, p, .content, .text')) {
                    colors.text = colorMatch[1].trim();
                }
            }
        });
    }

    extractElementColors($, colors) {
        // Extract from common UI elements
        
        // Header/Navigation colors
        if (!colors.primary) {
            const header = $('header, .header, .navbar, nav, .nav').first();
            if (header.length) {
                const bgColor = this.getComputedColor(header, 'background-color');
                if (bgColor && bgColor !== 'transparent') {
                    colors.primary = bgColor;
                }
            }
        }

        // Button colors
        if (!colors.button) {
            const button = $('button, .button, .btn, input[type="submit"]').first();
            if (button.length) {
                const bgColor = this.getComputedColor(button, 'background-color');
                if (bgColor && bgColor !== 'transparent') {
                    colors.button = bgColor;
                    if (!colors.accent) colors.accent = bgColor;
                }
            }
        }

        // Link colors
        if (!colors.link) {
            const link = $('a').first();
            if (link.length) {
                const linkColor = this.getComputedColor(link, 'color');
                if (linkColor) {
                    colors.link = linkColor;
                }
            }
        }

        // Body background and text
        if (!colors.background) {
            const body = $('body').first();
            if (body.length) {
                const bgColor = this.getComputedColor(body, 'background-color');
                if (bgColor && bgColor !== 'transparent') {
                    colors.background = bgColor;
                }
            }
        }

        if (!colors.text) {
            const body = $('body').first();
            if (body.length) {
                const textColor = this.getComputedColor(body, 'color');
                if (textColor) {
                    colors.text = textColor;
                }
            }
        }
    }

    extractBrandColors($, colors) {
        // Look for logo elements or brand-specific classes
        const brandElements = $('.logo, .brand, .branding, #logo, #brand');
        
        brandElements.each((i, el) => {
            const $el = $(el);
            
            // Check for background colors in brand elements
            const bgColor = this.getComputedColor($el, 'background-color');
            if (bgColor && bgColor !== 'transparent' && !colors.primary) {
                colors.primary = bgColor;
            }
            
            // Check for text colors in brand elements
            const textColor = this.getComputedColor($el, 'color');
            if (textColor && !colors.accent) {
                colors.accent = textColor;
            }
        });
    }

    getComputedColor($element, property) {
        // This is a simplified version - in a real browser environment,
        // we would use getComputedStyle. Here we extract from style attributes.
        const style = $element.attr('style') || '';
        const match = style.match(new RegExp(property.replace('-', '\\-') + ':\\s*([^;]+)', 'i'));
        return match ? match[1].trim() : null;
    }

    
    adjustColorBrightness(hex, percent) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const num = parseInt(hex, 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
    }

    normalizeColor(color) {
        if (!color) return color;
        
        // Remove extra spaces and quotes
        color = color.trim().replace(/['"]/g, '');
        
        // Convert rgb() to hex
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
        }
        
        // Convert rgba() to hex (ignoring alpha for now)
        const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
        if (rgbaMatch) {
            const [, r, g, b] = rgbaMatch;
            return `#${((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)}`;
        }
        
        return color;
    }

    ensureAccessibility(colors) {
        // Simple accessibility check - ensure sufficient contrast
        // This is a basic implementation - a full implementation would calculate actual contrast ratios
        
        if (this.isLightColor(colors.background) && this.isLightColor(colors.text)) {
            colors.text = '#333333'; // Dark text for light background
        } else if (this.isDarkColor(colors.background) && this.isDarkColor(colors.text)) {
            colors.text = '#ffffff'; // Light text for dark background
        }
    }

    isLightColor(color) {
        if (!color || color === 'transparent') return true;
        
        // Simple brightness check based on hex color
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 155;
        }
        
        return true; // Default to light if can't determine
    }

    isDarkColor(color) {
        return !this.isLightColor(color);
    }

    isValidColor(color) {
        if (!color) return false;
        
        // Check for hex colors
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return true;
        
        // Check for rgb/rgba
        if (/^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/.test(color)) return true;
        
        // Check for named colors (basic list)
        const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey'];
        if (namedColors.includes(color.toLowerCase())) return true;
        
        return false;
    }

    extractTypography($) {
        const typography = {
            primaryFont: null,
            secondaryFont: null,
            headingFont: null,
            bodyFont: null,
            fontSize: null,
            fontWeight: null
        };

        try {
            // Extract font families from body
            const bodyStyle = $('body').attr('style') || '';
            const bodyFontMatch = bodyStyle.match(/font-family:\s*([^;]+)/i);
            if (bodyFontMatch) {
                typography.bodyFont = bodyFontMatch[1].trim();
                typography.primaryFont = typography.bodyFont;
            }

            // Extract font families from headings
            const heading = $('h1, h2, h3').first();
            if (heading.length) {
                const headingStyle = heading.attr('style') || '';
                const headingFontMatch = headingStyle.match(/font-family:\s*([^;]+)/i);
                if (headingFontMatch) {
                    typography.headingFont = headingFontMatch[1].trim();
                }
            }

            // Extract from Google Fonts or font links
            $('link[href*="fonts.googleapis.com"], link[href*="fonts.google.com"]').each((i, el) => {
                const href = $(el).attr('href') || '';
                const fontMatch = href.match(/family=([^&:]+)/);
                if (fontMatch && !typography.primaryFont) {
                    typography.primaryFont = fontMatch[1].replace(/\+/g, ' ');
                }
            });

            return typography;
        } catch (error) {
            console.error('Typography extraction error:', error);
            return {
                primaryFont: null,
                secondaryFont: null,
                headingFont: null,
                bodyFont: null,
                fontSize: null,
                fontWeight: null
            };
        }
    }

    extractLayout($) {
        return {
            borderRadius: this.extractBorderRadius($),
            spacing: this.extractSpacing($),
            shadows: this.extractShadows($)
        };
    }

    extractBorderRadius($) {
        // Look for border radius in common elements
        const elements = $('button, .button, .btn, .card, .modal, input, .form-control');
        
        let commonRadius = null;
        elements.each((i, el) => {
            const style = $(el).attr('style') || '';
            const radiusMatch = style.match(/border-radius:\s*([^;]+)/i);
            if (radiusMatch && !commonRadius) {
                commonRadius = radiusMatch[1].trim();
            }
        });
        
        return commonRadius || '4px';
    }

    extractSpacing($) {
        // Basic spacing extraction - would be more sophisticated in practice
        return {
            small: '8px',
            medium: '16px',
            large: '24px'
        };
    }

    extractShadows($) {
        // Look for common shadow patterns
        const elements = $('.card, .modal, .dropdown, .tooltip, button, .button');
        
        let shadow = null;
        elements.each((i, el) => {
            const style = $(el).attr('style') || '';
            const shadowMatch = style.match(/box-shadow:\s*([^;]+)/i);
            if (shadowMatch && !shadow) {
                shadow = shadowMatch[1].trim();
            }
        });
        
        return shadow || '0 2px 4px rgba(0,0,0,0.1)';
    }

    extractBranding($) {
        return {
            logoUrl: this.extractLogoUrl($),
            faviconUrl: this.extractFaviconUrl($),
            brandName: this.extractBrandName($)
        };
    }

    extractLogoUrl($) {
        // Look for logo images
        const logoSelectors = [
            'img[alt*="logo" i]',
            'img[src*="logo" i]',
            '.logo img',
            '#logo img',
            '.brand img',
            '.branding img'
        ];
        
        for (const selector of logoSelectors) {
            const logo = $(selector).first();
            if (logo.length) {
                return logo.attr('src');
            }
        }
        
        return null;
    }

    extractFaviconUrl($) {
        const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first();
        return favicon.length ? favicon.attr('href') : null;
    }

    extractBrandName($) {
        // Try to extract brand name from title or meta tags
        const title = $('title').text().trim();
        const siteName = $('meta[property="og:site_name"]').attr('content');
        const appName = $('meta[name="application-name"]').attr('content');
        
        return siteName || appName || title.split(' - ')[0] || title.split(' | ')[0] || null;
    }

    getDefaultTheme() {
        return {
            colors: this.getDefaultColors(),
            typography: {
                primaryFont: null,
                secondaryFont: null,
                headingFont: null,
                bodyFont: null,
                fontSize: null,
                fontWeight: null
            },
            layout: {
                borderRadius: '4px',
                spacing: {
                    small: '8px',
                    medium: '16px',
                    large: '24px'
                },
                shadows: '0 2px 4px rgba(0,0,0,0.1)'
            },
            branding: {
                logoUrl: null,
                faviconUrl: null,
                brandName: null
            },
            extracted: false,
            timestamp: new Date().toISOString()
        };
    }

    getDefaultColors() {
        return {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#007bff',
            background: '#ffffff',
            text: '#333333',
            border: '#dee2e6',
            button: '#007bff',
            link: '#007bff'
        };
    }
}

module.exports = new ScrapingService();