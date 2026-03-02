const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const verifyToken = require('../middleware/authMiddleware');

// --- DEBUGGING LOGS ---
console.log('DEBUG: newsController type:', typeof newsController);
console.log('DEBUG: getNews function exists:', typeof newsController.getNews === 'function');
console.log('DEBUG: verifyToken function exists:', typeof verifyToken === 'function');
// ----------------------

// Line 7 is here:
router.get('/', verifyToken, newsController.getNews);

router.get('/search/:keyword', verifyToken, newsController.searchNews);
router.post('/:id/favorite', verifyToken, newsController.markAsFavorite);
router.get('/favorites', verifyToken, newsController.getFavoriteArticles);
router.post('/:id/read', verifyToken, newsController.markAsRead);
router.get('/read', verifyToken, newsController.getReadArticles);

module.exports = router;
