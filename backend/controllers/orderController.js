const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendWhatsApp } = require('../services/whatsapp');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new order & Razorpay order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            // Create Razorpay order
                const options = {
                amount: Math.round(totalPrice * 100), // amount in the smallest currency unit (paise)
                    currency: 'INR',
                    receipt: `rcpt_${new Date().getTime()}`,
                };

            const rzOrder = await razorpay.orders.create(options);

            const order = new Order({
                user: req.user._id,
                items: orderItems,
                shippingAddress,
                paymentMethod,
                totalAmount: totalPrice,
                razorpayOrderId: rzOrder.id,
            });

            const createdOrder = await order.save();

            res.status(201).json({
                order: createdOrder,
                razorpayOrder: rzOrder,
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            const order = await Order.findById(orderId).populate('user', 'name email phone');

            if (order) {
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                order.razorpayPaymentId = razorpay_payment_id;

                const updatedOrder = await order.save();

                // Send WhatsApp notification
                const message = `Hi ${order.user.name}! Your order #${order._id} has been confirmed. Total: Rs. ${order.totalAmount}. Thank you for shopping with RUVA!`;
                await sendWhatsApp(order.user.phone, message);

                res.json({ message: 'Payment verified successfully', order: updatedOrder });
            } else {
                res.status(404);
                throw new Error('Order not found');
            }
        } else {
            res.status(400);
            throw new Error('Invalid signature');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name phone');

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();

            // Send WhatsApp message based on status change
            let message = '';
            if (status === 'shipped') {
                message = `Great news ${order.user.name}! Your order #${order._id} has been shipped and is on the way.`;
            } else if (status === 'delivered') {
                message = `Hello ${order.user.name}! Your order #${order._id} has been delivered. We hope you love your new saree!`;
            }

            if (message) {
                 await sendWhatsApp(order.user.phone, message);
            }

            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addOrderItems,
    verifyPayment,
    getMyOrders,
    getOrders,
    updateOrderStatus,
};
