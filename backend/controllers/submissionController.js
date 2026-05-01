const UserSubmission = require('../models/UserSubmission');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs/promises');

const CLOUDINARY_TIMEOUT_MS = 2 * 60 * 1000;

const withTimeout = (promise, timeoutMs, message) =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });

const uploadLargeToCloudinary = (filePath, options) =>
    withTimeout(
        new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(filePath, options, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        }),
        CLOUDINARY_TIMEOUT_MS,
        'Cloudinary large upload timed out'
    );

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
                const baseOptions = {
                    folder: 'ruva_user_submissions/approved',
                    public_id: publicId,
                };
                const mimeType = String(req.file.mimetype || '').toLowerCase();
                const fileName = String(req.file.originalname || '').toLowerCase();
                const isLikelyVideo =
                    mimeType.startsWith('video/') ||
                    /\.(mp4|webm|mov|avi|mkv|m4v|3gp)$/i.test(fileName);

                if (isLikelyVideo) {
                    // For small/medium videos, normal video upload is faster and more reliable.
                    try {
                        uploadResult = await withTimeout(
                            cloudinary.uploader.upload(req.file.path, {
                                ...baseOptions,
                                resource_type: 'video',
                            }),
                            CLOUDINARY_TIMEOUT_MS,
                            'Cloudinary video upload timed out'
                        );
                    } catch (videoUploadError) {
                        // Fallback to chunked upload when direct upload fails.
                        uploadResult = await uploadLargeToCloudinary(req.file.path, {
                            ...baseOptions,
                            resource_type: 'video',
                            chunk_size: 20000000,
                        });
                    }
                } else {
                    try {
                        // Primary path: auto-detect type in Cloudinary.
                        uploadResult = await withTimeout(
                            cloudinary.uploader.upload(req.file.path, {
                                ...baseOptions,
                                resource_type: 'auto',
                            }),
                            CLOUDINARY_TIMEOUT_MS,
                            'Cloudinary upload timed out'
                        );
                    } catch (err) {
                        const errorMessage = String(err?.message || '').toLowerCase();
                        const isInvalidImage = errorMessage.includes('invalid image file');

                        if (!isInvalidImage) {
                            throw err;
                        }

                        // Fallback path for videos mislabeled by client/browser metadata.
                        uploadResult = await uploadLargeToCloudinary(req.file.path, {
                            ...baseOptions,
                            resource_type: 'video',
                            chunk_size: 20000000,
                        });
                    }
                }
            } finally {
                // Always try to clean up the temp file
                try {
                    await fs.unlink(req.file.path);
                } catch {
                    // ignore
                }
            }

            const uploadCandidates = Array.isArray(uploadResult)
                ? uploadResult.filter((item) => item && typeof item === 'object')
                : [uploadResult];
            const normalizedResult =
                uploadCandidates.find((item) => item.public_id || item.secure_url || item.url) ||
                uploadCandidates[uploadCandidates.length - 1] ||
                null;

            mediaUrl =
                normalizedResult?.secure_url ||
                normalizedResult?.url ||
                normalizedResult?.playback_url ||
                normalizedResult?.eager?.[0]?.secure_url ||
                normalizedResult?.eager?.[0]?.url ||
                '';
            resultPublicId = normalizedResult?.public_id || normalizedResult?.asset_id || '';
            mediaType = normalizedResult?.resource_type === 'video' ? 'video' : 'image';

            // Some Cloudinary flows return public_id without URL in upload response.
            // Re-fetch the resource metadata to resolve a stable delivery URL.
            if (!mediaUrl && resultPublicId) {
                const resourceTypesToTry = mediaType === 'video' ? ['video', 'image'] : ['image', 'video'];
                for (const type of resourceTypesToTry) {
                    try {
                        const resource = await withTimeout(
                            cloudinary.api.resource(resultPublicId, { resource_type: type }),
                            CLOUDINARY_TIMEOUT_MS,
                            `Cloudinary resource lookup timed out for ${type}`
                        );
                        const resolvedUrl = resource?.secure_url || resource?.url;
                        if (resolvedUrl) {
                            mediaUrl = resolvedUrl;
                            mediaType = type === 'video' ? 'video' : 'image';
                            break;
                        }
                    } catch {
                        // Try next resource type
                    }
                }
            }

            if (!mediaUrl || !resultPublicId) {
                const cloudinaryMessage =
                    normalizedResult?.error?.message ||
                    normalizedResult?.message ||
                    'Cloudinary failed to return valid URLs';
                console.error('Cloudinary upload failed or returned unexpected object:', uploadResult);
                console.error('Cloudinary normalized upload candidate keys:', normalizedResult ? Object.keys(normalizedResult) : null);
                res.status(500);
                throw new Error(cloudinaryMessage);
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