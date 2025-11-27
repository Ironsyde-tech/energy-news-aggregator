// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    const d = new Date(date);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return d.toLocaleDateString('en-US', options);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get from localStorage with expiration check
 * @param {string} key - Storage key
 * @returns {any|null} Stored value or null if expired/not found
 */
export function getFromCache(key) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const data = JSON.parse(item);
        const now = new Date().getTime();

        if (data.expiry && now > data.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return data.value;
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
}

/**
 * Set to localStorage with expiration
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
export function setToCache(key, value, ttl) {
    try {
        const now = new Date().getTime();
        const item = {
            value: value,
            expiry: ttl ? now + ttl : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error('Cache write error:', error);
    }
}

/**
 * Clear expired cache items
 */
export function clearExpiredCache() {
    try {
        const now = new Date().getTime();
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            if (key.startsWith('news_')) {
                const item = localStorage.getItem(key);
                if (item) {
                    const data = JSON.parse(item);
                    if (data.expiry && now > data.expiry) {
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Cache cleanup error:', error);
    }
}

/**
 * Extract domain from URL
 * @param {string} url - URL to parse
 * @returns {string} Domain name
 */
export function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (error) {
        return 'Unknown Source';
    }
}

/**
 * Show loading state
 * @param {HTMLElement} container - Container element
 */
export function showLoading(container) {
    container.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p style="margin-top: 1rem; font-family: var(--font-secondary); color: var(--color-text-secondary);">
        Loading news...
      </p>
    </div>
  `;
}

/**
 * Show error message
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 */
export function showError(container, message = 'Failed to load news. Please try again later.') {
    container.innerHTML = `
    <div class="error-message">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate random placeholder image
 * @param {Array} placeholders - Array of placeholder image paths
 * @returns {string} Random placeholder image path
 */
export function getRandomPlaceholder(placeholders) {
    return placeholders[Math.floor(Math.random() * placeholders.length)];
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
