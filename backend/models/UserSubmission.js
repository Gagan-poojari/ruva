const mongoose = require('mongoose');

const userSubmissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        userName: {
            type: String,
            required: true,
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
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('UserSubmission', userSubmissionSchema);
