const Review = require('../models/Review');
const { cloudinary } = require('../config/cloudinary');
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
            const isVideo = req.file.mimetype?.startsWith('video/');
            mediaType = isVideo ? 'video' : 'image';
            let result;
            try {
                const options = {
                    folder: 'ruva_reviews',
                    resource_type: isVideo ? 'video' : 'image',
                };
                if (isVideo) {
                    result = await cloudinary.uploader.upload_large(req.file.path, { ...options, chunk_size: 6000000 });
                } else {
                    result = await cloudinary.uploader.upload(req.file.path, options);
                }
            } finally {
                try { await fs.unlink(req.file.path); } catch { }
            }

            if (!result || (!result.secure_url && !result.url)) {
                console.error("Cloudinary upload failed in createReview:", JSON.stringify(result, null, 2));
                res.status(500);
                throw new Error(`Cloudinary upload failed: ${result?.error?.message || 'Missing URLs'}`);
            }

            mediaUrl = result.secure_url || result.url;
            publicId = result.public_id;
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
            // delete old from cloudinary
            if (review.publicId) {
                try { await cloudinary.uploader.destroy(review.publicId, { resource_type: review.mediaType === 'video' ? 'video' : 'image' }); } catch { }
            }
            const isVideo = req.file.mimetype?.startsWith('video/');
            review.mediaType = isVideo ? 'video' : 'image';
            let result;
            try {
                const options = {
                    folder: 'ruva_reviews',
                    resource_type: isVideo ? 'video' : 'image',
                };
                if (isVideo) {
                    result = await cloudinary.uploader.upload_large(req.file.path, { ...options, chunk_size: 6000000 });
                } else {
                    result = await cloudinary.uploader.upload(req.file.path, options);
                }
            } finally {
                try { await fs.unlink(req.file.path); } catch { }
            }

            if (!result || (!result.secure_url && !result.url)) {
                console.error("Cloudinary upload failed in updateReview:", JSON.stringify(result, null, 2));
                res.status(500);
                throw new Error(`Cloudinary upload failed: ${result?.error?.message || 'Missing URLs'}`);
            }

            review.mediaUrl = result.secure_url || result.url;
            review.publicId = result.public_id;
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
            try { await cloudinary.uploader.destroy(review.publicId, { resource_type: review.mediaType === 'video' ? 'video' : 'image' }); } catch { }
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (e) { next(e); }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
