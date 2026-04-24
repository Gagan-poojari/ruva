const express = require('express');
const router = express.Router();
const { getReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');
const { submissionDiskParser } = require('../config/cloudinary');

// Public
router.get('/', getReviews);

// Admin CRUD
router.post('/',   protect, admin, submissionDiskParser.single('media'), createReview);
router.put('/:id', protect, admin, submissionDiskParser.single('media'), updateReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
