const rateLimit = require('express-rate-limit');

const guestTrackRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many tracking attempts. Please try again in a minute.',
});

module.exports = guestTrackRateLimit;
