# Global Energy News Platform

A fully developed, professional energy news platform modeled after EnergyNow.com, featuring automated news aggregation, multiple category pages, and industry-standard presentation.

## 🌟 Features

- **Multi-page Architecture**: Professional layout with dedicated category pages
- **News Aggregation**: Automated energy news fetching from NewsAPI
- **Category Pages**:
  - US Energy News
  - CDN & International News  
  - Press Releases
  - Showcase Features
  - Company Announcements
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: Professional news aesthetic with animations and micro-interactions
- **SEO Optimized**: Proper meta tags, semantic HTML, and performance optimization

## 📁 Project Structure

```
rig/
├── index.html                          # Homepage with hero article & news sections
├── category-us-news.html               # US Energy News category page
├── category-international.html         # International news category page
├── category-press-releases.html        # Press releases page
├── category-showcase.html              # Showcase features page
├── category-announcements.html         # Company announcements page
├── css/
│   ├── main.css                        # Global styles & design system
│   ├── components.css                  # Reusable UI components
│   └── pages.css                       # Page-specific styles
├── js/
│   ├── config.js                       # Configuration & API settings
│   ├── utils.js                        # Utility functions
│   ├── news-aggregator.js              # Main news fetching module
│   └── category-loader.js              # Category page loader
└── [images]                            # Article images
```

## 🚀 Setup Instructions

### 1. Get a Free NewsAPI Key

1. Visit [https://newsapi.org/](https://newsapi.org/)
2. Click "Get API Key" and sign up for a free account
3. Copy your API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 2. Configure the API Key

Open `js/config.js` and replace `YOUR_NEWSAPI_KEY_HERE` with your actual API key:

```javascript
const CONFIG = {
  newsAPI: {
    apiKey: 'your_actual_api_key_here',  // ← Replace this
    // rest of config...
  }
}
```

### 3. Run Locally

**Option A: Using Python**
```bash
# Python 3
python3 -m http.server 8000

# Then visit: http://localhost:8000
```

**Option B: Using Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000

# Then visit: http://localhost:8000
```

**Option C: Using VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🎨 Customization

### Update Branding

Edit `index.html` and all category HTML files:
- **Logo Circle**: Change "GEN" text (line ~40)
- **Company Name**: Update "Global Energy News" (line ~42)
- **Tagline**: Modify "Trusted Industry Coverage" (line ~43)

### Modify Color Scheme

Edit `css/main.css` (lines 13-30):
```css
:root {
  --color-primary: #c41e3a;       /* Main brand color */
  --color-primary-dark: #9a1829;  /* Darker variant */
  --color-accent: #d4af37;        /* Gold accent */
  /* ... */
}
```

### Adjust News Keywords

Edit `js/config.js` to customize what news appears:
```javascript
keywords: {
  general: 'your keywords here',
  usNews: 'energy OR oil AND USA',
  // ... customize for each category
}
```

## 📊 API Usage Limits

**Free NewsAPI Tier:**
- 100 requests per day
- Developer use only
- 15-minute caching implemented to minimize API calls

**Recommendations:**
- **For Production**: Upgrade to NewsAPI paid plan or implement backend caching
- **Alternative**: Use RSS feed aggregation (fallback already implemented)

## 🔧 Configuration Options

Edit `js/config.js` to customize:

```javascript
cache: {
  duration: 15 * 60 * 1000,  // Cache duration (15 minutes)
  enabled: true               // Enable/disable caching
}
```

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 How It Works

1. **Homepage (`index.html`)**: 
   - Displays your original rig explosion article as the hero feature
   - Loads 5 news aggregation sections below the article
   - Each section fetchesand displays relevant energy news

2. **Category Pages**:
   - Dedicated pages for each news category
   - Dynamic news loading based on category keywords
   - Pagination support for browsing more articles

3. **News Aggregation**:
   - Fetches from NewsAPI using category-specific keywords
   - Caches results for 15 minutes to reduce API calls
   - Falls back to placeholder content if API fails

## 🐛 Troubleshooting

### News Not Loading?

1. **Check API Key**: Ensure it's correctly set in `js/config.js`
2. **CORS Issues**: Must run through a local server (not `file://`)
3. **API Limits**: Check if you've exceeded 100 requests/day
4. **Console Errors**: Open browser DevTools → Console tab for error messages

### Blank Pages?

- Ensure all CSS and JS files are in correct directories
- Check browser console for 404 errors
- Verify you're running through a web server

### Images Not Loading?

- Ensure image files are in the main `/rig` directory
- Check image paths are relative, not absolute

## 🚀 Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select main branch as source
4. Your site will be live at `https://yourusername.github.io/repo-name`

### Netlify

1. Drag and drop the `/rig` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Site deploys instantly at `https://your-site-name.netlify.app`

### Vercel

```bash
npm install -g vercel
cd /path/to/rig
vercel
```

## 📝 Next Steps

- [ ] Add a search functionality
- [ ] Implement newsletter signup
- [ ] Add commodities data ticker
- [ ] Create events calendar
- [ ] Build backend for better content management
- [ ] Add user authentication for saved articles

## 💡 Tips

- **Update Content**: News refreshes every 15 minutes automatically
- **Clear Cache**: Clear browser localStorage to force fresh data fetch
- **Customize Layout**: Modify CSS grid columns in `components.css`
- **Add Categories**: Extend `CONFIG.categories` in `config.js`

## 📄 License

This project is for personal/educational use. News content belongs to respective publishers.

## 🤝 Support

For issues or questions:
1. Check browser console for errors
2. Verify API key is valid
3. Ensure local server is running
4. Check NewsAPI status at https://newsapi.org/status

---

**Built with ❤️ for the energy industry** | Global Energy News Platform
