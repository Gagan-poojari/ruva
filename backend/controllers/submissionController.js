const UserSubmission = require('../models/UserSubmission');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs/promises');

// @desc    Upload media submission
// @route   POST /api/submissions
// @access  Private
const uploadSubmission = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No media file provided');
        }

        const mediaType = req.file.mimetype?.startsWith('video/') ? 'video' : 'image';
        const description = req.body.description || '';
        const safeName = req.user?.name ? req.user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'user';
        const timestamp = Date.now();
        const publicId = `${safeName}_${timestamp}`;

        let uploadResult;
        try {
            if (mediaType === 'video') {
                uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'ruva_user_submissions/pending',
                    resource_type: 'video',
                    public_id: publicId,
                });
            } else {
                uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'ruva_user_submissions/pending',
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

        const mediaUrl = uploadResult.secure_url || uploadResult.url;
        const resultPublicId = uploadResult.public_id;

        if (!mediaUrl || !resultPublicId) {
            console.error("Cloudinary upload failed or returned unexpected object:", uploadResult);
            res.status(500);
            throw new Error('Cloudinary failed to return valid URLs');
        }

        const submission = await UserSubmission.create({
            user: req.user._id,
            userName: req.user.name,
            mediaUrl,
            publicId: resultPublicId,
            mediaType,
            description,
            status: 'pending',
        });

        res.status(201).json({
            message: 'Media uploaded successfully',
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

        // Rename/Move file in Cloudinary to approved folder
        try {
            const newPublicId = submission.publicId.replace('pending', 'approved');
            await cloudinary.uploader.rename(submission.publicId, newPublicId, { overwrite: true });
            
            // Re-fetch the new secure URL
            const result = await cloudinary.api.resource(newPublicId);
            
            submission.publicId = newPublicId;
            submission.mediaUrl = result.secure_url;
            submission.status = 'approved';
            await submission.save();

            res.json({ message: 'Submission approved successfully', submission });
        } catch (cloudinaryError) {
            console.error('Cloudinary rename error:', cloudinaryError);
            res.status(500);
            throw new Error('Failed to move media to approved folder in Cloudinary');
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
            await cloudinary.uploader.destroy(submission.publicId, { resource_type: submission.mediaType });
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
    approveSubmission,
    deleteSubmission,
};
