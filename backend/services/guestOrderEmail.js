const { sendEmail } = require('./notifications');

const getFrontendBaseUrl = () => {
    const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    return base;
};

const sendGuestOrderConfirmation = async ({ guestEmail, orderId, guestOrderToken }) => {
    const trackUrl = `${getFrontendBaseUrl()}/track?email=${encodeURIComponent(guestEmail)}&token=${encodeURIComponent(guestOrderToken)}`;
    const subject = `RUVA order #${orderId} received`;
    const message = [
        'Thank you for your order with RUVA.',
        '',
        `Order number: ${orderId}`,
        '',
        'Track your order anytime using this link:',
        trackUrl,
        '',
        'Keep this link safe — you will need your email and tracking token to view order status.',
    ].join('\n');

    return sendEmail({ toEmail: guestEmail, subject, message });
};

module.exports = { sendGuestOrderConfirmation };
