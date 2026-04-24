const UserSubmission = require('../models/UserSubmission');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs/promises');

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
            mediaType = req.file.mimetype?.startsWith('video/') ? 'video' : 'image';
            let uploadResult;
            try {
                if (mediaType === 'video') {
                    uploadResult = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'ruva_user_submissions/approved',
                        resource_type: 'video',
                        public_id: publicId,
                    });
                } else {
                    uploadResult = await cloudinary.uploader.upload(req.file.path, {
                        folder: 'ruva_user_submissions/approved',
                        resource_type: 'image',
                        public_id: publicId,
                    });
                }
            } finally {
                // Always try to clean up the temp file
                try {
                    await fs.unlink(req.file.path);
                } catch {
                    // ignore
                }
            }

            mediaUrl = uploadResult.secure_url || uploadResult.url;
            resultPublicId = uploadResult.public_id;

            if (!mediaUrl || !resultPublicId) {
                console.error("Cloudinary upload failed or returned unexpected object:", uploadResult);
                res.status(500);
                throw new Error('Cloudinary failed to return valid URLs');
            }
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

        // Move media from pending -> approved when possible.
        // Some older docs may not include "/pending/" in publicId, so approval should still succeed.
        try {
            const hasPendingFolder = submission.publicId.includes('/pending/');

            if (hasPendingFolder) {
                const newPublicId = submission.publicId.replace('/pending/', '/approved/');
                await cloudinary.uploader.rename(submission.publicId, newPublicId, { overwrite: true });

                // Re-fetch URL after rename
                const result = await cloudinary.api.resource(newPublicId, {
                    resource_type: submission.mediaType,
                });
                submission.publicId = newPublicId;
                submission.mediaUrl = result.secure_url || submission.mediaUrl;
            }

            submission.status = 'approved';
            await submission.save();
            res.json({ message: 'Submission approved successfully', submission });
        } catch (cloudinaryError) {
            console.error('Cloudinary approve/rename error:', cloudinaryError);
            res.status(500);
            throw new Error('Failed to approve submission media in Cloudinary');
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
                await cloudinary.uploader.destroy(submission.publicId, { resource_type: submission.mediaType });
            }
        } catch (err) {
            console.error(`Failed to delete media ${submission.publicId} from Cloudinary:`, err.message);
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
