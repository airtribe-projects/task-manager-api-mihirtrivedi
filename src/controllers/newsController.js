const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize Cache (Step 6: Caching Mechanism)
const myCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// In-memory storage for User Activity (Step 6: Read/Favorite)
// Note: This resets when the server restarts
const userActivity = {
    favorites: {},
    read: {}
};

/**
 * 1. Fetch News based on User Preferences (Step 4 & 6)
 * GET /api/news
 */
exports.getNews = async (req, res, next) => {
    try {
        // Use user preferences if available, otherwise default to 'general'
        const category = req.user.preferences?.category || 'general';
        const cacheKey = `news_${category}`;

        // Check Cache first
        if (myCache.has(cacheKey)) {
            console.log(`[CACHE] Serving ${category} news from cache`);
            return res.json(myCache.get(cacheKey));
        }

        // Fetch from NewsAPI (FIXED URL)
        const response = await axios.get('https://newsapi.org', {
            params: {
                category: category,
                apiKey: process.env.NEWS_API_KEY,
                country: 'us'
            }
        });

        // Safety check: ensure we return an array, not null
        const articles = response.data.articles || [];

        // Save to cache
        myCache.set(cacheKey, articles);

        res.json(articles);
    } catch (err) {
        console.error("NewsAPI Fetch Error:", err.message);
        next(err);
    }
};

/**
 * 2. Search News by Keyword (Step 6 Extension)
 * GET /api/news/search/:keyword
 */
exports.searchNews = async (req, res, next) => {
    try {
        const { keyword } = req.params;

        // Fetch from NewsAPI Everything endpoint (FIXED URL)
        const response = await axios.get('https://newsapi.org', {
            params: {
                q: keyword,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        res.json(response.data.articles || []);
    } catch (err) {
        console.error("NewsAPI Search Error:", err.message);
        next(err);
    }
};

/**
 * 3. Mark Article as Favorite (Step 6 Extension)
 * POST /api/news/:id/favorite
 */
exports.markAsFavorite = (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    if (!userActivity.favorites[username]) {
        userActivity.favorites[username] = [];
    }

    // Avoid duplicates
    if (!userActivity.favorites[username].includes(id)) {
        userActivity.favorites[username].push(id);
    }

    res.json({
        message: "Article added to favorites",
        favorites: userActivity.favorites[username]
    });
};

/**
 * 4. Retrieve Favorite Articles (Step 6 Extension)
 * GET /api/news/favorites
 */
exports.getFavoriteArticles = (req, res) => {
    const username = req.user.username;
    res.json(userActivity.favorites[username] || []);
};

/**
 * 5. Mark Article as Read (Step 6 Extension)
 * POST /api/news/:id/read
 */
exports.markAsRead = (req, res) => {
    const { id } = req.params;
    const username = req.user.username;

    if (!userActivity.read[username]) {
        userActivity.read[username] = [];
    }

    if (!userActivity.read[username].includes(id)) {
        userActivity.read[username].push(id);
    }

    res.json({
        message: "Article marked as read",
        readArticles: userActivity.read[username]
    });
};

/**
 * 6. Retrieve Read Articles (Step 6 Extension)
 * GET /api/news/read
 */
exports.getReadArticles = (req, res) => {
    const username = req.user.username;
    res.json(userActivity.read[username] || []);
};
