require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const userRoutes = require('./src/routes/userRoutes');
const newsRoutes = require('./src/routes/newsRoutes');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * 1. Routes Setup
 * userRoutes handles: /api/register, /api/login
 * newsRoutes handles: /api/news, /api/news/search, /api/news/favorites, etc.
 */
app.use('/api', userRoutes);
app.use('/api/news', newsRoutes);

/**
 * 2. Periodic Cache Update (Step 6 Extension)
 * This background task runs every 30 minutes to pre-fetch news for popular categories.
 * It simulates a real-time aggregator by keeping the cache "warm".
 */
cron.schedule('*/30 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Refreshing background news cache...`);
    try {
        const categories = ['business', 'technology', 'science', 'sports'];

        for (const cat of categories) {
            // FIX: Added /v2/top-headlines to the URL
            await axios.get('https://newsapi.org', {
                params: {
                    category: cat,
                    apiKey: process.env.NEWS_API_KEY,
                    country: 'us'
                }
            });
        }
        console.log("Background cache refresh successful.");
    } catch (err) {
        // Log specific API errors (like 401 Unauthorized or 429 Rate Limit)
        console.error("Background cache refresh failed:", err.message);
    }
});

/**
 * 3. SINGLE Global Error Handler (Step 5 & 6)
 * This MUST be placed after all routes.
 */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Log the error for the developer in the terminal
    console.error(`[ERROR] ${err.message}`);

    res.status(statusCode).json({
        status: 'error',
        message: err.message || "Something went wrong on the server!",
        // Stack trace only visible in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

/**
 * 4. Server Initialization
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("--------------------------------------------------");
    console.log(`News Aggregator API is buzzing on http://localhost:${PORT}`);
    console.log("--------------------------------------------------");
});
