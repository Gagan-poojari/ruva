const validator = require('validator');

const GUEST_TOKEN_MIN_LEN = 8;
const GUEST_TOKEN_MAX_LEN = 12;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 20;

const normalizeEmail = (raw) => {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim().toLowerCase().slice(0, MAX_EMAIL_LEN);
    if (!trimmed || !validator.isEmail(trimmed)) return null;
    return trimmed;
};

const sanitizeGuestToken = (raw) => {
    if (typeof raw !== 'string') return null;
    const token = raw.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (token.length < GUEST_TOKEN_MIN_LEN || token.length > GUEST_TOKEN_MAX_LEN) {
        return null;
    }
    return token;
};

const validateGuestPhone = (raw) => {
    if (typeof raw !== 'string') return null;
    const phone = raw.trim().slice(0, MAX_PHONE_LEN);
    if (!phone) return null;
    return phone;
};

module.exports = {
    normalizeEmail,
    sanitizeGuestToken,
    validateGuestPhone,
    GUEST_TOKEN_MIN_LEN,
    GUEST_TOKEN_MAX_LEN,
};
