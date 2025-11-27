// ===================================
// CONFIGURATION
// ===================================

const CONFIG = {
    // NewsAPI Configuration
    // Free tier allows commercial use on GitHub Pages
    // Get free key from https://newsapi.org/
    newsapi: {
        apiKey: '8102fdce1bbb4ceb82c3982bc3bd4087',
        baseURL: 'https://newsapi.org/v2',
        language: 'en',
        pageSize: 20 // NewsAPI free tier limit per request
    },

    // Cache Configuration
    cache: {
        duration: 15 * 60 * 1000, // 15 minutes in milliseconds
        enabled: true
    },

    // Energy News Keywords
    keywords: {
        general: 'energy',
        featured: 'oil gas energy',
        usNews: 'energy United States',
        international: 'energy global',
        pressReleases: 'energy press release',
        showcase: 'energy technology'
    },

    // RSS Feed Sources (Fallback)
    rssFeeds: [
        {
            name: 'Reuters Energy',
            url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
            category: 'general'
        },
        {
            name: 'Oil & Gas Journal',
            url: 'https://www.ogj.com/RSS',
            category: 'oil-gas'
        }
    ],

    // Categories
    categories: {
        'us-news': {
            title: 'US Energy News',
            keywords: 'energy OR oil OR gas OR renewable AND (USA OR America OR United States)',
            description: 'Latest energy news from across the United States'
        },
        'international': {
            title: 'CDN & International News',
            keywords: 'energy OR oil OR gas OR renewable AND (Canada OR international OR global)',
            description: 'Global energy news and Canadian market updates'
        },
        'press-releases': {
            title: 'Press Releases',
            keywords: 'energy company announcement OR press release',
            description: 'Latest company announcements and press releases'
        },
        'showcase': {
            title: 'Showcase Features',
            keywords: 'energy technology OR innovation OR product launch',
            description: 'Featured innovations, products, and industry technologies'
        },
        'announcements': {
            title: 'Company Announcements',
            keywords: 'energy company merger OR acquisition OR quarterly results',
            description: 'Corporate news and business developments'
        }
    },

    // Placeholder Images
    placeholderImages: [
        '/offshore_rig_hero_1764097748859.png',
        '/rig_machinery_detail_1764098727220.png',
        '/gulf_map_location_1764098764500.png'
    ]
};

export default CONFIG;
