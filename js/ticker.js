/**
 * Commodities Ticker
 * Displays live/mock market data for energy commodities
 */

const MARKET_DATA = [
    { symbol: 'WTI Crude', price: 78.45, change: 1.25, percent: 1.62 },
    { symbol: 'Brent Crude', price: 82.90, change: 1.10, percent: 1.34 },
    { symbol: 'Natural Gas', price: 2.85, change: -0.05, percent: -1.72 },
    { symbol: 'Heating Oil', price: 2.95, change: 0.02, percent: 0.68 },
    { symbol: 'Gasoline', price: 2.45, change: 0.03, percent: 1.24 },
    { symbol: 'Gold', price: 2045.50, change: 12.40, percent: 0.61 },
    { symbol: 'Carbon Credits', price: 85.20, change: -0.40, percent: -0.47 },
    { symbol: 'Solar Index', price: 145.30, change: 2.10, percent: 1.47 }
];

export function initTicker() {
    const tickerContainer = document.getElementById('commodities-ticker');
    if (!tickerContainer) return;

    // Create ticker wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ticker-wrapper';

    // Create ticker content (duplicated for seamless scrolling)
    const content = document.createElement('div');
    content.className = 'ticker-content';

    // Render items
    const itemsHtml = MARKET_DATA.map(item => createTickerItem(item)).join('');
    content.innerHTML = itemsHtml + itemsHtml; // Duplicate for infinite scroll

    wrapper.appendChild(content);
    tickerContainer.appendChild(wrapper);
}

function createTickerItem(item) {
    const isPositive = item.change >= 0;
    const colorClass = isPositive ? 'ticker-up' : 'ticker-down';
    const arrow = isPositive ? '▲' : '▼';

    return `
        <div class="ticker-item">
            <span class="ticker-symbol">${item.symbol}</span>
            <span class="ticker-price">${item.price.toFixed(2)}</span>
            <span class="ticker-change ${colorClass}">
                ${arrow} ${Math.abs(item.change).toFixed(2)} (${Math.abs(item.percent).toFixed(2)}%)
            </span>
        </div>
    `;
}

// Auto-initialize if loaded directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTicker);
} else {
    initTicker();
}
