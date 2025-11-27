// ===================================
// CATEGORY LOADER
// ===================================

import CONFIG from './config.js';
import newsAggregator from './news-aggregator.js';
import { showLoading, showError } from './utils.js';

/**
 * Load news for specific category page
 * @param {string} category - Category key from CONFIG
 * @param {number} page - Page number
 */
export async function loadCategoryNews(category, page = 1) {
    const categoryConfig = CONFIG.categories[category];

    if (!categoryConfig) {
        console.error(`Category "${category}" not found in config`);
        return;
    }

    const container = document.getElementById('news-container');
    if (!container) {
        console.error('News container not found');
        return;
    }

    // Show loading state
    showLoading(container);

    try {
        // Fetch news for this category
        const articles = await newsAggregator.fetchNews({
            query: categoryConfig.keywords,
            category: category,
            page: page
        });

        // Render news
        newsAggregator.renderNews(articles, container, {
            layout: 'grid',
            showExcerpt: true,
            showImage: true,
            showCategory: true
        });

        // Update pagination
        updatePagination(page, category);

    } catch (error) {
        console.error('Failed to load category news:', error);
        showError(container);
    }
}

/**
 * Update pagination controls
 * @param {number} currentPage - Current page number
 * @param {string} category - Category key
 */
function updatePagination(currentPage, category) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = `
    <button 
      class="pagination-button" 
      ${currentPage === 1 ? 'disabled' : ''}
      onclick="loadCategoryNews('${category}', ${currentPage - 1})"
    >
      ← Previous
    </button>
    <span class="pagination-info" style="font-family: var(--font-secondary); font-size: var(--font-size-sm);">
      Page ${currentPage}
    </span>
    <button 
      class="pagination-button"
      onclick="loadCategoryNews('${category}', ${currentPage + 1})"
    >
      Next →
    </button>
  `;
}

/**
 * Initialize category page
 */
export function initCategoryPage() {
    // Get category from URL or data attribute
    const body = document.body;
    const category = body.dataset.category;

    if (category) {
        loadCategoryNews(category);
    }
}

// Make loadCategoryNews available globally for pagination buttons
window.loadCategoryNews = loadCategoryNews;
