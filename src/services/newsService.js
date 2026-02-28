const axios = require('axios');

// In-memory cache object
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches news from NewsAPI.org with basic caching.
 * @param {Array} preferences - User's preferred categories (e.g., ['technology', 'sports'])
 */
exports.getNewsByPreferences = async (preferences) => {
    // 1. Create a unique cache key based on preferences
    const prefsArray = Array.isArray(preferences) ? preferences : [];
    const cacheKey = prefsArray.slice().sort().join(',') || 'general';

    // 2. Check if we have a valid cached version in memory
    const cachedData = cache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
        console.log("Serving from cache...");
        return cachedData.articles;
    }

    try {
        // 3. If no cache, fetch from the external NewsAPI
        // NewsAPI top-headlines only accepts ONE category string at a time
        const categoryParam = prefsArray.length > 0 ? prefsArray[0] : 'general';
        
        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                category: categoryParam,
                language: 'en',
                apiKey: process.env.NEWS_API_KEY
            }
        });

        const articles = response.data.articles;

        // 4. Update the cache with a timestamp to avoid hitting rate limits
        cache[cacheKey] = {
            articles: articles,
            timestamp: Date.now()
        };

        return articles;
    } catch (error) {
        console.error("Error fetching news from external API:", error.message);
        // This error will be caught by your global error handler in server.js
        throw new Error("Could not fetch news headlines.");
    }
};
