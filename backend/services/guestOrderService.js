const crypto = require('crypto');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const { buildVerifiedOrderItems } = require('../utils/orderStockUtils');
const { normalizeEmail, validateGuestPhone, sanitizeGuestToken } = require('../utils/guestOrderSanitize');
const { alert, ALERT_SEVERITY } = require('./monitoring');
const { settlePaidOrder } = require('./orderSettlementService');

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const TOKEN_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TOKEN_LENGTH = 10;
const MAX_TOKEN_RETRIES = 8;

const generateGuestOrderToken = () => {
    const bytes = crypto.randomBytes(TOKEN_LENGTH);
    let token = '';
    for (let i = 0; i < TOKEN_LENGTH; i += 1) {
        token += TOKEN_CHARSET[bytes[i] % TOKEN_CHARSET.length];
    }
    return token;
};

const createUniqueGuestOrderToken = async () => {
    for (let attempt = 0; attempt < MAX_TOKEN_RETRIES; attempt += 1) {
        const guest_order_token = generateGuestOrderToken();
        const exists = await Order.exists({ guest_order_token });
        if (!exists) {
            return guest_order_token;
        }
    }
    throw new Error('Unable to generate a unique guest order token');
};

const formatGuestOrderDetail = (order) => ({
    _id: order._id,
    items: order.items,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    totalAmount: order.totalAmount,
    deliveryFee: order.deliveryFee,
    taxAmount: order.taxAmount,
    razorpayOrderId: order.razorpayOrderId,
    holdExpiresAt: order.holdExpiresAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
});

const createGuestOrder = async ({
    orderItems,
    shippingAddress,
    paymentMethod,
    guest_email: rawGuestEmail,
    guest_phone: rawGuestPhone,
}) => {
    const guest_email = normalizeEmail(rawGuestEmail);
    const guest_phone = validateGuestPhone(rawGuestPhone);

    if (!guest_email) {
        return { ok: false, code: 400, message: 'A valid guest email is required' };
    }
    if (!guest_phone) {
        return { ok: false, code: 400, message: 'Guest phone is required' };
    }
    if (!shippingAddress) {
        return { ok: false, code: 400, message: 'Shipping address is required' };
    }

    const verified = await buildVerifiedOrderItems(orderItems);
    if (!verified.ok) {
        return { ok: false, code: verified.code, message: verified.message };
    }

    const DELIVERY_FEE = 49;
    const taxAmount = 0;
    const grandTotal = verified.verifiedTotal + DELIVERY_FEE;

    let finalAmount = Math.round(grandTotal * 100);
    if (process.env.RAZORPAY_FORCE_TEST_AMOUNT === 'true') {
        finalAmount = 100;
    }

    let rzOrder;
    try {
        rzOrder = await razorpay.orders.create({
            amount: finalAmount,
            currency: 'INR',
            receipt: `guest_${Date.now()}`,
        });
    } catch (rzError) {
        console.error('Guest Razorpay order creation failed:', rzError);
        await alert(ALERT_SEVERITY.ERROR, 'guest_order.create_failed', {
            guest_email,
            reason: rzError.message,
        });
        return { ok: false, code: 502, message: 'Payment gateway is temporarily unavailable. Please try again later.' };
    }

    const guest_order_token = await createUniqueGuestOrderToken();
    const holdTimeout = 12 * 60 * 1000;

    const order = new Order({
        user: null,
        guest_email,
        guest_phone,
        guest_order_token,
        items: verified.verifiedOrderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay',
        paymentStatus: 'pending',
        status: 'pending',
        totalAmount: grandTotal,
        deliveryFee: DELIVERY_FEE,
        taxAmount,
        razorpayOrderId: rzOrder.id,
        holdExpiresAt: new Date(Date.now() + holdTimeout),
    });

    const createdOrder = await order.save();

    return {
        ok: true,
        order: createdOrder,
        razorpayOrder: rzOrder,
        guest_order_token,
        order_id: createdOrder._id,
    };
};

const guestOrderAuthFilter = (guest_email, guest_order_token) => ({
    guest_email,
    guest_order_token,
    $or: [{ user: null }, { user: { $exists: false } }],
});

const findGuestOrderForTracking = async ({ guest_email, guest_order_token }) => {
    return Order.findOne(guestOrderAuthFilter(guest_email, guest_order_token))
        .populate('items.product', 'name images price')
        .lean();
};

const findGuestOrderForVerification = async ({ orderId, guest_email, guest_order_token }) => {
    if (!isValidObjectId(orderId)) {
        return null;
    }
    return Order.findOne({
        _id: orderId,
        ...guestOrderAuthFilter(guest_email, guest_order_token),
    });
};

const verifyGuestPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
    guest_email: rawGuestEmail,
    guest_order_token: rawGuestToken,
}) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        return { ok: false, code: 400, message: 'Missing payment verification fields' };
    }

    const guest_email = normalizeEmail(rawGuestEmail);
    const guest_order_token = sanitizeGuestToken(rawGuestToken);

    if (!guest_email || !guest_order_token) {
        return { ok: false, code: 400, message: 'Valid guest email and tracking token are required' };
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

    if (razorpay_signature !== expectedSign) {
        await alert(ALERT_SEVERITY.ERROR, 'guest_payment.verify_failed', {
            orderId,
            reason: 'signature_mismatch',
        });
        return { ok: false, code: 400, message: 'Payment verification failed: Invalid signature' };
    }

    const order = await findGuestOrderForVerification({ orderId, guest_email, guest_order_token });

    if (!order) {
        return { ok: false, code: 404, message: 'Order not found' };
    }

    if (order.paymentStatus === 'paid') {
        return { ok: true, alreadyVerified: true, order };
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
        return { ok: false, code: 400, message: 'Order ID mismatch' };
    }

    let razorpayPayment;
    try {
        razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchError) {
        return { ok: false, code: 400, message: 'Unable to fetch payment details from gateway' };
    }

    if (!razorpayPayment) {
        return { ok: false, code: 400, message: 'Unable to fetch payment details from gateway' };
    }

    if (razorpayPayment.order_id !== order.razorpayOrderId) {
        return { ok: false, code: 400, message: 'Payment does not belong to this order' };
    }

    if (razorpayPayment.status !== 'captured') {
        return {
            ok: false,
            code: 400,
            message: `Payment not successful (status: ${razorpayPayment.status})`,
        };
    }

    const expectedAmountInPaise = Math.round(order.totalAmount * 100);
    if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
        return { ok: false, code: 400, message: 'Paid amount does not match order total' };
    }

    const updatedOrder = await settlePaidOrder({
        order,
        razorpayPaymentId: razorpay_payment_id,
    });

    return { ok: true, order: updatedOrder };
};

module.exports = {
    createGuestOrder,
    findGuestOrderForTracking,
    formatGuestOrderDetail,
    verifyGuestPayment,
};
