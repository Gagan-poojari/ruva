const express = require('express');
const router = express.Router();
const {
    uploadSubmission,
    getSubmissions,
    getApprovedSubmissions,
    approveSubmission,
    deleteSubmission,
} = require('../controllers/submissionController');
const { protect, admin } = require('../middleware/authMiddleware');
const { submissionDiskParser } = require('../config/cloudinary');

// Public – homepage review wall
router.get('/approved', getApprovedSubmissions);

router.route('/')
    .get(protect, admin, getSubmissions)
    .post(protect, submissionDiskParser.single('media'), uploadSubmission);

router.route('/:id/approve')
    .put(protect, admin, approveSubmission);

router.route('/:id')
    .delete(protect, admin, deleteSubmission);

module.exports = router;
