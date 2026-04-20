const express = require('express');
const router = express.Router();
const { generateProductDescription } = require('../services/aiService');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Generate product description using AI
// @route   POST /api/ai/describe
// @access  Private/Admin
router.post('/describe', protect, admin, async (req, res, next) => {
    try {
        const { name, category, fabric, occasion, colors } = req.body;
        
        if (!name) {
            res.status(400);
            throw new Error('Product name is required for AI generation');
        }

        const description = await generateProductDescription({ name, category, fabric, occasion, colors });
        res.json({ description });
    } catch (error) {
        // Differentiate between rate limit and other errors
        if (error.message.includes('limit reached')) {
            res.status(429);
        }
        next(error);
    }
});

module.exports = router;
