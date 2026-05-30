const {
    createGuestOrder,
    findGuestOrderForTracking,
    formatGuestOrderDetail,
    verifyGuestPayment,
} = require('../services/guestOrderService');
const { alert, ALERT_SEVERITY } = require('../services/monitoring');
const { sendGuestOrderConfirmation } = require('../services/guestOrderEmail');
const { normalizeEmail, sanitizeGuestToken } = require('../utils/guestOrderSanitize');

// @desc    Create guest order & Razorpay order
// @route   POST /api/orders/guest
// @access  Public
const addGuestOrderItems = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            guest_email,
            guest_phone,
        } = req.body;

        const result = await createGuestOrder({
            orderItems,
            shippingAddress,
            paymentMethod,
            guest_email,
            guest_phone,
        });

        if (!result.ok) {
            res.status(result.code);
            throw new Error(result.message);
        }

        sendGuestOrderConfirmation({
            guestEmail: result.order.guest_email,
            orderId: result.order._id,
            guestOrderToken: result.guest_order_token,
        }).catch((err) => {
            console.error('Guest order confirmation email failed:', err.message);
        });

        res.status(201).json({
            order_id: result.order_id,
            guest_order_token: result.guest_order_token,
            order: result.order,
            razorpayOrder: result.razorpayOrder,
        });
    } catch (error) {
        console.error('addGuestOrderItems error:', error.message);
        next(error);
    }
};

// @desc    Track guest order by email + token
// @route   GET /api/orders/track
// @access  Public
const trackGuestOrder = async (req, res, next) => {
    try {
        const guest_email = normalizeEmail(req.query.email);
        const guest_order_token = sanitizeGuestToken(req.query.token);

        if (!guest_email || !guest_order_token) {
            res.status(400);
            throw new Error('Valid email and tracking token are required');
        }

        const order = await findGuestOrderForTracking({ guest_email, guest_order_token });

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        res.json(formatGuestOrderDetail(order));
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Razorpay payment for guest order
// @route   POST /api/orders/guest/verify
// @access  Public (guest email + token required)
const verifyGuestOrderPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
            guest_email,
            guest_order_token,
        } = req.body;

        const result = await verifyGuestPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
            guest_email,
            guest_order_token,
        });

        if (!result.ok) {
            res.status(result.code);
            throw new Error(result.message);
        }

        if (result.alreadyVerified) {
            return res.json({ message: 'Payment already verified', order: result.order });
        }

        res.json({ message: 'Payment verified successfully', order: result.order });
    } catch (error) {
        console.error('verifyGuestOrderPayment error:', error.message);
        await alert(ALERT_SEVERITY.ERROR, 'guest_payment.verify_failed', {
            orderId: req.body?.orderId,
            reason: error.message,
        });
        next(error);
    }
};

module.exports = {
    addGuestOrderItems,
    trackGuestOrder,
    verifyGuestOrderPayment,
};
