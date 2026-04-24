const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        quote: {
            type: String,
            required: [true, 'Review quote is required'],
            trim: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },
        mediaUrl: {
            type: String,
            default: '',
        },
        publicId: {
            type: String,
            default: '',
        },
        mediaType: {
            type: String,
            enum: ['image', 'video', 'none'],
            default: 'none',
        },
        location: {
            type: String,
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
