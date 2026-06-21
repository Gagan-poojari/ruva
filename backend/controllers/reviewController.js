const Review = require('../models/Review');
const imageKitService = require('../services/imageKitService');
const fs = require('fs/promises');

// @desc  Get all reviews (public)
// @route GET /api/reviews
const getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ order: 1, createdAt: -1 });
        res.json(reviews);
    } catch (e) { next(e); }
};

// @desc  Create review (admin)
// @route POST /api/reviews
const createReview = async (req, res, next) => {
    try {
        const { customerName, quote, rating, location, order } = req.body;
        let mediaUrl = '', publicId = '', mediaType = 'none';

        if (req.file) {
            const isVideo =
                req.file.mimetype?.startsWith('video/') ||
                /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(req.file.originalname || '');
            mediaType = isVideo ? 'video' : 'image';
            let result;
            try {
                result = await imageKitService.uploadImage(req.file.path, {
                    folder: '/ruva_reviews',
                });
            } finally {
                try { await fs.unlink(req.file.path); } catch { }
            }

            if (!result || !result.success) {
                console.error("ImageKit upload failed in createReview:", result ? result.error : 'Unknown error');
                res.status(500);
                throw new Error(`ImageKit upload failed: ${result ? result.error : 'Missing response'}`);
            }

            mediaUrl = result.url;
            publicId = result.publicId;
        }

        const review = await Review.create({
            customerName, quote, rating, location, order,
            mediaUrl, publicId, mediaType,
        });
        res.status(201).json(review);
    } catch (e) { next(e); }
};

// @desc  Update review (admin)
// @route PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) { res.status(404); throw new Error('Review not found'); }

        const { customerName, quote, rating, location, order } = req.body;
        if (customerName !== undefined) review.customerName = customerName;
        if (quote !== undefined) review.quote = quote;
        if (rating !== undefined) review.rating = rating;
        if (location !== undefined) review.location = location;
        if (order !== undefined) review.order = order;

        // Replace media if a new file is uploaded
        if (req.file) {
            // delete old from ImageKit
            if (review.publicId) {
                try { await imageKitService.deleteImage(review.publicId); } catch { }
            }
            const isVideo =
                req.file.mimetype?.startsWith('video/') ||
                /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(req.file.originalname || '');
            review.mediaType = isVideo ? 'video' : 'image';
            let result;
            try {
                result = await imageKitService.uploadImage(req.file.path, {
                    folder: '/ruva_reviews',
                });
            } finally {
                try { await fs.unlink(req.file.path); } catch { }
            }

            if (!result || !result.success) {
                console.error("ImageKit upload failed in updateReview:", result ? result.error : 'Unknown error');
                res.status(500);
                throw new Error(`ImageKit upload failed: ${result ? result.error : 'Missing response'}`);
            }

            review.mediaUrl = result.url;
            review.publicId = result.publicId;
        }

        const updated = await review.save();
        res.json(updated);
    } catch (e) { next(e); }
};

// @desc  Delete review (admin)
// @route DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) { res.status(404); throw new Error('Review not found'); }

        if (review.publicId) {
            try { await imageKitService.deleteImage(review.publicId); } catch { }
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (e) { next(e); }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
