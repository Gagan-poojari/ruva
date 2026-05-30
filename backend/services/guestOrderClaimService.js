const Order = require('../models/Order');
const { normalizeEmail } = require('../utils/guestOrderSanitize');

/**
 * Attach guest orders to a newly registered user (same email, no user yet).
 * Must run inside an active MongoDB transaction session.
 */
const claimGuestOrdersForUser = async ({ userId, email, session }) => {
    const guest_email = normalizeEmail(email);
    if (!guest_email || !userId) {
        return { matchedCount: 0, modifiedCount: 0 };
    }

    const result = await Order.updateMany(
        {
            guest_email,
            $or: [{ user: null }, { user: { $exists: false } }],
        },
        { $set: { user: userId } },
        { session }
    );

    return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
    };
};

module.exports = { claimGuestOrdersForUser };
