const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    loginAdmin,
    getMe,
    googleAuth,
    updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/admin/login', loginAdmin);
router.route('/me').get(protect, getMe).put(protect, updateProfile);

module.exports = router;
