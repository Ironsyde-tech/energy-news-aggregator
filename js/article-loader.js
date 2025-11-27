import { formatDate, sanitizeHTML, getRandomPlaceholder } from './utils.js';
import CONFIG from './config.js';
import newsAggregator from './news-aggregator.js';

document.addEventListener('DOMContentLoaded', () => {
    loadArticle();
    loadSidebarNews();
});

async function loadSidebarNews() {
    const container = document.getElementById('sidebar-news-container');
    if (!container) return;

    try {
        // Fetch latest news for sidebar
        const articles = await newsAggregator.fetchNews({
            category: 'general',
            country: 'us'
        });

        newsAggregator.renderNews(articles, container, {
            layout: 'list',
            limit: 5,
            showExcerpt: false,
            showImage: false, // Keep sidebar clean
            showCategory: true
        });
    } catch (error) {
        console.error('Error loading sidebar news:', error);
    }
}

function loadArticle() {
    // Get article data from session storage
    const articleData = sessionStorage.getItem('currentArticle');

    if (!articleData) {
        // No data found, redirect to home
        window.location.href = 'index.html';
        return;
    }

    try {
        const article = JSON.parse(articleData);
        renderArticle(article);
    } catch (e) {
        console.error('Error parsing article data:', e);
        document.getElementById('article-body').innerHTML = '<p>Error loading article content.</p>';
    }
}

function renderArticle(article) {
    // Title
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = sanitizeHTML(article.title);

    // Source
    const sourceEl = document.getElementById('article-source');
    if (sourceEl) sourceEl.textContent = sanitizeHTML(article.source?.name || 'Global Energy News');

    // Date
    const dateEl = document.getElementById('article-date');
    if (dateEl) dateEl.textContent = formatDate(article.publishedAt);

    // Image
    const imgEl = document.getElementById('article-image');
    if (imgEl) {
        const imgSrc = article.urlToImage || getRandomPlaceholder(CONFIG.placeholderImages);
        imgEl.src = imgSrc;
        imgEl.style.display = 'block';
        imgEl.onerror = () => {
            imgEl.src = getRandomPlaceholder(CONFIG.placeholderImages);
        };
    }

    // Content
    const bodyEl = document.getElementById('article-body');
    if (bodyEl) {
        // Special handling for pinned article with trusted HTML content
        // Check if explicitly pinned OR if content appears to be pre-formatted HTML
        const isHTML = article.content && article.content.trim().startsWith('<');

        if ((article.isPinned || isHTML) && article.content) {
            bodyEl.innerHTML = article.content;
        } else {
            // Standard handling for external API articles
            let content = article.content || '';
            let description = article.description || '';

            // Clean up strings
            const clean = (text) => text ? text.trim().replace(/\s+/g, ' ') : '';
            content = clean(content).replace(/\[\+\d+ chars\]$/, '');
            description = clean(description);

            let html = '';

            // 1. Always show Description as Lead Summary (if available)
            if (description) {
                html += `<div class="article-lead" style="font-size: 1.3rem; line-height: 1.5; font-weight: 500; color: var(--color-text-primary); margin-bottom: 2rem; border-left: 4px solid var(--color-primary); padding-left: 1rem;">
                            ${sanitizeHTML(description)}
                         </div>`;
            }

            // 2. Process Content to remove overlap with Description
            // We want to show the *rest* of the content if it adds anything new
            let uniqueContent = content;

            // If content starts with description, strip it out
            if (content.startsWith(description)) {
                uniqueContent = content.substring(description.length).trim();
            }
            // Fuzzy check: if content contains the first 50 chars of description, assume it's a superset
            else if (description.length > 50 && content.includes(description.substring(0, 50))) {
                // This is harder to strip perfectly without overlap detection, 
                // but usually NewsAPI content is either "Desc" or "Desc + more".
                // If we can't cleanly strip, we might just show it if it's significantly longer.
                if (content.length > description.length + 50) {
                    // If content is much longer, it might be worth showing even with some overlap, 
                    // or we try to find where the description ends.
                    // For now, let's just show it if it's unique enough.
                    uniqueContent = content;
                } else {
                    uniqueContent = ''; // Content is basically just the description
                }
            }

            // 3. Render Unique Content as Body Paragraphs
            if (uniqueContent) {
                const paragraphs = uniqueContent.split('\n').filter(p => p.trim().length > 0);
                paragraphs.forEach(p => {
                    html += `<p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.2rem;">${sanitizeHTML(p)}</p>`;
                });
            } else if (!description) {
                // Fallback if both are empty
                html += '<p>No preview content available.</p>';
            }

            // 4. "Continue Reading" Call to Action
            html += `<div class="read-more-container" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                        <p style="font-style: italic; color: var(--color-text-secondary); margin-bottom: 1rem;">
                            This is a preview of the full article. Read the complete story at the source.
                        </p>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-block; text-decoration: none;">
                            Read Full Article →
                        </a>
                     </div>`;

            bodyEl.innerHTML = html;
        }
    }

    // Original Link
    const linkEl = document.getElementById('article-original-link');
    if (linkEl) {
        linkEl.href = article.url;
        linkEl.textContent = article.source?.name || 'Original Source';
    }

    // Update page title
    document.title = `${article.title} | Global Energy News`;
}
