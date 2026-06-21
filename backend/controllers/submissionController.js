const UserSubmission = require('../models/UserSubmission');
const imageKitService = require('../services/imageKitService');
const fs = require('fs/promises');
const path = require('path');

// @desc    Upload media submission
// @route   POST /api/submissions
// @access  Private
const uploadSubmission = async (req, res, next) => {
    try {
        const description = (req.body.description || '').trim();

        if (!req.file && !description) {
            res.status(400);
            throw new Error('Please add a review message or media file');
        }

        let mediaType = 'none';
        let mediaUrl = '';
        let resultPublicId = '';
        const safeName = req.user?.name ? req.user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'user';
        const timestamp = Date.now();
        const publicId = `${safeName}_${timestamp}`;

        if (req.file) {
            let uploadResult;
            try {
                const mimeType = String(req.file.mimetype || '').toLowerCase();
                const isVideo = mimeType.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv|m4v|3gp)$/i.test(req.file.originalname || '');
                mediaType = isVideo ? 'video' : 'image';

                const originalExt = path.extname(req.file.originalname || '');
                const fileName = `${publicId}${originalExt || ''}`;

                uploadResult = await imageKitService.uploadImage(req.file.path, {
                    folder: '/ruva_user_submissions/approved',
                    fileName: fileName
                });
            } finally {
                // Always try to clean up the temp file
                try {
                    await fs.unlink(req.file.path);
                } catch {
                    // ignore
                }
            }

            if (!uploadResult || !uploadResult.success) {
                const errorMessage = uploadResult?.error || 'ImageKit failed to upload';
                console.error('ImageKit upload failed:', uploadResult);
                res.status(500);
                throw new Error(errorMessage);
            }

            mediaUrl = uploadResult.url;
            resultPublicId = uploadResult.publicId;
        }

        const submission = await UserSubmission.create({
            user: req.user._id,
            userName: req.user.name,
            mediaUrl,
            publicId: resultPublicId,
            mediaType,
            description,
            status: 'approved',
        });

        res.status(201).json({
            message: 'Review submitted successfully',
            submission,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all media submissions
// @route   GET /api/submissions
// @access  Private/Admin
const getSubmissions = async (req, res, next) => {
    try {
        const submissions = await UserSubmission.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get public submissions (approved, optionally pending)
// @route   GET /api/submissions/approved
// @access  Public
const getApprovedSubmissions = async (req, res, next) => {
    try {
        const includePending = String(req.query.includePending || '').toLowerCase() === 'true';
        const statuses = includePending ? ['approved', 'pending'] : ['approved'];

        const submissions = await UserSubmission.find({ status: { $in: statuses } })
            .select('userName mediaUrl mediaType description createdAt')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(submissions);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve submission
// @route   PUT /api/submissions/:id/approve
// @access  Private/Admin
const approveSubmission = async (req, res, next) => {
    try {
        const submission = await UserSubmission.findById(req.params.id);

        if (!submission) {
            res.status(404);
            throw new Error('Submission not found');
        }

        if (submission.status === 'approved') {
            res.status(400);
            throw new Error('Submission is already approved');
        }

        // Move media from pending -> approved when possible (legacy Cloudinary support is no-op).
        try {
            const hasPendingFolder = submission.publicId && submission.publicId.includes('/pending/');

            if (hasPendingFolder) {
                console.warn(`Attempted to rename legacy Cloudinary file ${submission.publicId} but Cloudinary is decoupled.`);
            }

            submission.status = 'approved';
            await submission.save();
            res.json({ message: 'Submission approved successfully', submission });
        } catch (dbError) {
            console.error('Approval DB error:', dbError);
            res.status(500);
            throw new Error('Failed to approve submission in database');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
const deleteSubmission = async (req, res, next) => {
    try {
        const submission = await UserSubmission.findById(req.params.id);

        if (!submission) {
            res.status(404);
            throw new Error('Submission not found');
        }

        try {
            if (submission.publicId && submission.mediaType !== 'none') {
                const isLegacyCloudinary = submission.publicId.includes('/') || submission.publicId.startsWith('ruva_');
                if (isLegacyCloudinary) {
                    console.warn(`Skipping deletion of legacy Cloudinary asset: ${submission.publicId}`);
                } else {
                    await imageKitService.deleteImage(submission.publicId);
                }
            }
        } catch (err) {
            console.error(`Failed to delete media ${submission.publicId} from ImageKit:`, err.message);
        }

        await submission.deleteOne();
        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadSubmission,
    getSubmissions,
    getApprovedSubmissions,
    approveSubmission,
    deleteSubmission,
};