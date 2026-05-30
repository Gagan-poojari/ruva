const express = require('express');
const router = express.Router();
const {
    addGuestOrderItems,
    trackGuestOrder,
    verifyGuestOrderPayment,
} = require('../controllers/guestOrderController');
const guestTrackRateLimit = require('../middleware/guestTrackRateLimit');

router.post('/guest/verify', verifyGuestOrderPayment);
router.post('/guest', addGuestOrderItems);
router.get('/track', guestTrackRateLimit, trackGuestOrder);

module.exports = router;
