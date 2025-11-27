// ===================================
// NEWS AGGREGATOR - MAIN MODULE
// ===================================

import CONFIG from './config.js';
import {
    formatDate,
    formatRelativeTime,
    truncateText,
    getFromCache,
    setToCache,
    extractDomain,
    sanitizeHTML,
    getRandomPlaceholder
} from './utils.js';

/**
 * News Aggregator Class
 * Handles fetching news from NewsAPI and rendering to DOM
 */
class NewsAggregator {
    constructor() {
        this.apiKey = CONFIG.newsapi.apiKey;
        this.baseURL = CONFIG.newsapi.baseURL;
        this.cacheEnabled = CONFIG.cache.enabled;
        this.cacheDuration = CONFIG.cache.duration;
    }

    /**
     * Fetch news articles from NewsAPI
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of articles
     */
    async fetchNews(options = {}) {
        const {
            query = CONFIG.keywords.general,
            category = 'general',
            pageSize = CONFIG.newsapi.pageSize,
            page = 1
        } = options;

        // Check cache first
        const cacheKey = `newsapi_${category}_${page}`;
        if (this.cacheEnabled) {
            const cached = getFromCache(cacheKey);
            if (cached) {
                console.log('Using cached news data');
                return cached;
            }
        }

        try {
            // Build API URL for NewsAPI
            const params = new URLSearchParams({
                q: query,
                language: CONFIG.newsapi.language,
                pageSize: pageSize,
                page: page,
                apiKey: this.apiKey
            });

            const url = `${this.baseURL}/everything?${params}`;

            // Fetch from API
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.articles) {
                throw new Error(data.message || 'No articles found');
            }

            let articles = data.articles || [];

            // NewsAPI already returns in the correct format, just ensure consistency
            articles = articles.filter(article => article.urlToImage); // Filter out articles without images

            // Cache the results
            if (this.cacheEnabled && articles.length > 0) {
                setToCache(cacheKey, articles, this.cacheDuration);
            }

            return articles;

        } catch (error) {
            console.error('News fetch error:', error);
            console.log('Falling back to RSS feeds...');
            
            // Try RSS feeds as fallback
            const rssArticles = await this.fetchRSSFeeds(category);
            if (rssArticles.length > 0) {
                return rssArticles;
            }

            // Return empty array if all sources fail
            return [];
        }
    }

    /**
     * Fetch news from RSS feeds as fallback
     * @param {string} category - Category to fetch RSS for
     * @returns {Promise<Array>} Array of articles from RSS feeds
     */
    async fetchRSSFeeds(category = 'general') {
        try {
            const articles = [];
            const feedsToTry = CONFIG.rssFeeds.filter(feed => feed.category === category || category === 'general');

            for (const feed of feedsToTry) {
                try {
                    // Use CORS proxy for RSS feeds
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
                    const response = await fetch(proxyUrl);
                    
                    if (!response.ok) continue;

                    const data = await response.json();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data.contents, 'text/xml');

                    // Extract items
                    const items = xmlDoc.querySelectorAll('item');
                    items.forEach(item => {
                        const article = {
                            title: item.querySelector('title')?.textContent || 'Untitled',
                            description: item.querySelector('description')?.textContent || '',
                            url: item.querySelector('link')?.textContent || '#',
                            urlToImage: null,
                            publishedAt: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                            source: { name: feed.name }
                        };

                        // Try to extract image from description
                        const descDiv = document.createElement('div');
                        descDiv.innerHTML = article.description;
                        const img = descDiv.querySelector('img');
                        if (img) {
                            article.urlToImage = img.src;
                        }

                        articles.push(article);
                    });
                } catch (error) {
                    console.warn(`Failed to fetch RSS feed: ${feed.name}`, error);
                    continue;
                }
            }

            return articles.slice(0, CONFIG.newsapi.pageSize);
        } catch (error) {
            console.error('RSS fallback failed:', error);
            return [];
        }
    }

    /**
     * Get fallback news when API fails (Mock Data for Production/Demo)
     * @param {string} category - Category to generate mock data for
     * @returns {Array} Array of placeholder articles
     */
    getFallbackNews(category = 'general') {
        const baseDate = new Date();

        // Common source names
        const sources = ['Energy Monitor', 'Global Power', 'EcoWorld', 'Oil & Gas Journal', 'Tech Energy'];

        // Helper to generate article
        const makeArticle = (title, desc, offsetHours, imgIndex) => ({
            title,
            description: desc,
            url: '#',
            urlToImage: CONFIG.placeholderImages[imgIndex % CONFIG.placeholderImages.length],
            publishedAt: new Date(baseDate - offsetHours * 3600000).toISOString(),
            source: { name: sources[imgIndex % sources.length] }
        });

        let articles = [];

        if (category === 'us-news') {
            articles = [
                makeArticle('Texas Grid Resilience Project Completes Phase One', 'Major infrastructure upgrades in the Permian Basin aim to stabilize power delivery during extreme weather events.', 2, 0),
                makeArticle('US Solar Manufacturing Booms Following New Incentives', 'Domestic production of photovoltaic cells has doubled in the last quarter, driven by federal tax credits.', 5, 1),
                makeArticle('California Offshore Wind Auction Draws Record Bids', 'Energy giants compete for leases off the Pacific coast, signaling strong confidence in the US floating wind market.', 8, 2),
                makeArticle('New Pipeline Safety Regulations Proposed by DOT', 'The Department of Transportation seeks stricter monitoring standards for aging natural gas infrastructure.', 12, 3),
                makeArticle('Alaskan LNG Project Secures Key Export Permit', 'The long-awaited approval clears the path for increased natural gas exports to Asian markets.', 24, 4)
            ];
        } else if (category === 'international') {
            articles = [
                makeArticle('EU Reaches Deal on Renewable Energy Directive', 'Member states agree to raise the binding renewable target to 42.5% by 2030.', 1, 2),
                makeArticle('India Unveils Massive Green Hydrogen Roadmap', 'The ambitious plan targets production of 5 million tonnes of green hydrogen annually by 2030.', 4, 3),
                makeArticle('North Sea Wind Power Hub Begins Construction', 'A joint venture between three nations kicks off the world\'s largest artificial energy island project.', 7, 4),
                makeArticle('Brazil Expands Biofuel Mandate for Transport Sector', 'New legislation requires a higher blend of ethanol in gasoline to reduce carbon emissions.', 10, 0),
                makeArticle('Japan Restarts Two More Nuclear Reactors', 'Grid stability concerns drive the return of nuclear power in the Kansai region.', 15, 1)
            ];
        } else if (category === 'press-releases') {
            articles = [
                makeArticle('Apex Energy Announces Q3 Financial Results', 'Record operational efficiency drives strong quarterly performance despite market volatility.', 3, 4),
                makeArticle('SolarTech Inc. Launches Next-Gen Inverter Series', 'The new "Helios" line promises 99% efficiency and seamless smart grid integration.', 6, 0),
                makeArticle('Global Oil Corp to Acquire Renewables Startup', 'Strategic acquisition accelerates the company\'s transition toward a diversified energy portfolio.', 9, 1),
                makeArticle('WindVest Partners Closes $500M Green Bond Offering', 'Proceeds will fund the development of three new onshore wind farms in the Midwest.', 14, 2),
                makeArticle('HydroGen Systems Appoints New Chief Sustainability Officer', 'Industry veteran Sarah Jenkins joins the leadership team to drive ESG initiatives.', 20, 3)
            ];
        } else {
            // General / Featured / Showcase
            articles = [
                makeArticle('Global Oil Demand Forecast Revised Upward for 2026', 'International Energy Agency cites recovering industrial activity in Asia and resilient US consumption as key drivers.', 0, 0),
                makeArticle('New Offshore Wind Farm Approved in North Sea', 'The massive 2GW project promises to power over 1.5 million homes and create thousands of green energy jobs.', 1, 1),
                makeArticle('US Natural Gas Exports Hit Record High', 'LNG shipments from Gulf Coast terminals surged last month, driven by high demand in Europe.', 2, 2),
                makeArticle('Solar Tech Breakthrough: Efficiency Jumps to 30%', 'Researchers at MIT have developed a new perovskite-silicon tandem cell that shatters previous records.', 3, 3),
                makeArticle('Major Oil Major Announces Net-Zero Target by 2050', 'In a surprise move, the energy giant committed to full decarbonization within three decades.', 4, 4)
            ];
        }

        return articles;
    }

    /**
     * Render news articles to container
     * @param {Array} articles - Array of articles
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Render options
     */
    renderNews(articles, container, options = {}) {
        const {
            layout = 'grid', // 'grid' or 'list'
            limit = null,
            showExcerpt = true,
            showImage = true,
            showCategory = true
        } = options;

        if (!articles || articles.length === 0) {
            // Check if there was an error stored in the last fetch attempt (optional enhancement)
            // For now, just show a generic message, but if we returned [] due to error, it might be helpful to know.
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No news articles found. (Please check API key or connection)</p>';
            return;
        }

        const articlesToShow = limit ? articles.slice(0, limit) : articles;

        if (layout === 'grid') {
            this.renderGrid(articlesToShow, container, { showExcerpt, showImage, showCategory });
        } else {
            this.renderList(articlesToShow, container, { showExcerpt, showImage, showCategory });
        }
    }

    /**
     * Render articles in grid layout
     */
    renderGrid(articles, container, options) {
        const newsGrid = document.createElement('div');
        newsGrid.className = 'news-grid';

        articles.forEach(article => {
            const card = this.createNewsCard(article, options);
            newsGrid.appendChild(card);
        });

        container.innerHTML = '';
        container.appendChild(newsGrid);
    }

    /**
     * Render articles in list layout
     */
    renderList(articles, container, options) {
        const newsList = document.createElement('ul');
        newsList.className = 'news-list';

        articles.forEach(article => {
            const item = this.createNewsListItem(article, options);
            newsList.appendChild(item);
        });

        container.innerHTML = '';
        container.appendChild(newsList);
    }

    /**
     * Open article in local view
     */
    openArticle(article) {
        sessionStorage.setItem('currentArticle', JSON.stringify(article));
        window.location.href = 'article.html';
    }

    /**
     * Create news card element
     */
    createNewsCard(article, options) {
        const { showExcerpt, showImage, showCategory } = options;

        const card = document.createElement('div');
        card.className = 'news-card';

        // Image
        if (showImage) {
            const img = document.createElement('img');
            img.className = 'news-card-image';
            img.src = article.urlToImage || getRandomPlaceholder(CONFIG.placeholderImages);
            img.alt = sanitizeHTML(article.title);
            img.loading = 'lazy';
            img.onerror = () => {
                img.src = getRandomPlaceholder(CONFIG.placeholderImages);
            };
            // Add click handler
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => this.openArticle(article));
            card.appendChild(img);
        }

        // Content
        const content = document.createElement('div');
        content.className = 'news-card-content';

        // Category/Source
        if (showCategory && article.source) {
            const category = document.createElement('span');
            category.className = 'news-card-category';
            category.textContent = sanitizeHTML(article.source.name);
            content.appendChild(category);
        }

        // Title
        const title = document.createElement('h3');
        title.className = 'news-card-title';
        const titleLink = document.createElement('a');
        titleLink.href = '#'; // Prevent default
        titleLink.textContent = sanitizeHTML(article.title);
        titleLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.openArticle(article);
        });
        title.appendChild(titleLink);
        content.appendChild(title);

        // Excerpt
        if (showExcerpt && article.description) {
            const excerpt = document.createElement('p');
            excerpt.className = 'news-card-excerpt';
            excerpt.textContent = sanitizeHTML(truncateText(article.description, 120));
            content.appendChild(excerpt);
        }

        // Meta
        const meta = document.createElement('div');
        meta.className = 'news-card-meta';

        const date = document.createElement('span');
        date.className = 'news-card-date';
        date.textContent = formatDate(article.publishedAt);
        meta.appendChild(date);

        const link = document.createElement('a');
        link.className = 'news-card-link';
        link.href = '#';
        link.textContent = 'Read more →';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.openArticle(article);
        });
        meta.appendChild(link);

        content.appendChild(meta);
        card.appendChild(content);

        return card;
    }

    /**
     * Create news list item element
     */
    createNewsListItem(article, options) {
        const { showImage } = options;

        const item = document.createElement('li');
        item.className = 'news-list-item';

        const link = document.createElement('a');
        link.className = 'news-list-link';
        link.href = '#';
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.openArticle(article);
        });

        // Image
        if (showImage) {
            const img = document.createElement('img');
            img.className = 'news-list-thumbnail';
            img.src = article.urlToImage || getRandomPlaceholder(CONFIG.placeholderImages);
            img.alt = sanitizeHTML(article.title);
            img.loading = 'lazy';
            img.onerror = () => {
                img.src = getRandomPlaceholder(CONFIG.placeholderImages);
            };
            link.appendChild(img);
        }

        // Content
        const content = document.createElement('div');
        content.className = 'news-list-content';

        const title = document.createElement('h3');
        title.className = 'news-list-title';
        title.textContent = sanitizeHTML(article.title);
        content.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'news-card-meta';

        if (article.source) {
            const source = document.createElement('span');
            source.className = 'news-card-category';
            source.textContent = sanitizeHTML(article.source.name);
            meta.appendChild(source);
        }

        const date = document.createElement('span');
        date.className = 'news-card-date';
        date.textContent = formatDate(article.publishedAt);
        meta.appendChild(date);

        content.appendChild(meta);
        link.appendChild(content);
        item.appendChild(link);

        return item;
    }
}

// Create and export singleton instance
const newsAggregator = new NewsAggregator();
export default newsAggregator;
