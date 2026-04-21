const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendWhatsApp } = require('../services/whatsapp');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const USER_REFUNDABLE_STATUSES = ['pending', 'confirmed', 'packed'];
const ADMIN_REFUND_LOGIN_EMAIL = process.env.ADMIN_REFUND_EMAIL || 'ruva@marketshpere.com';
const ADMIN_REFUND_LOGIN_PASSWORD = process.env.ADMIN_REFUND_PASSWORD || 'RuvaXmarketshpere';
const REFUND_AUTH_HEADER = 'x-admin-refund-token';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const ensureOrderRefundable = (order, { allowAdminOverride = false } = {}) => {
    if (!order) {
        return { ok: false, code: 404, message: 'Order not found' };
    }

    if (order.paymentStatus !== 'paid') {
        return { ok: false, code: 400, message: 'Only paid orders can be refunded' };
    }

    if (order.paymentStatus === 'refunded' || order.refundId) {
        return { ok: false, code: 400, message: 'Order is already refunded' };
    }

    if (!allowAdminOverride && !USER_REFUNDABLE_STATUSES.includes(order.status)) {
        return { ok: false, code: 400, message: 'Refund is only allowed before shipment' };
    }

    return { ok: true };
};

const processRefund = async ({ order, reason, initiatedBy }) => {
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.totalAmount * 100),
        speed: 'normal',
        notes: {
            orderId: order._id.toString(),
            initiatedBy,
            reason: reason || 'Not provided',
        },
    });

    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    order.refundId = refund.id;
    order.refundedAt = new Date();
    order.refundReason = reason || '';
    order.refundInitiatedBy = initiatedBy;
    order.holdExpiresAt = undefined;

    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            if (item.size) {
                const sizeIndex = product.sizes.findIndex(s => s.label === item.size);
                if (sizeIndex !== -1) {
                    product.sizes[sizeIndex].stock += item.qty;
                }
            } else {
                product.stock += item.qty;
            }
            await product.save();
        }
    }

    const updatedOrder = await order.save();
    return { updatedOrder, refund };
};

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
            // Check stock availability (Effective Stock = Physical Stock - Active Holds)
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (!product) {
                    res.status(404);
                    throw new Error(`Product not found: ${item.name}`);
                }

                // Find active holds for this product and size
                const activeHolds = await Order.find({
                    'items.product': item.product,
                    paymentStatus: 'pending',
                    holdExpiresAt: { $gt: new Date() }
                });

                let reservedQty = 0;
                activeHolds.forEach(holdOrder => {
                    holdOrder.items.forEach(holdItem => {
                        if (holdItem.product.toString() === item.product.toString() && holdItem.size === item.size) {
                            reservedQty += holdItem.qty;
                        }
                    });
                });

                // Get physical stock
                let physicalStock = product.stock;
                if (item.size) {
                    const sizeObj = product.sizes.find(s => s.label === item.size);
                    physicalStock = sizeObj ? sizeObj.stock : 0;
                }

                if (physicalStock - reservedQty < item.qty) {
                    res.status(400);
                    throw new Error('out of stock');
                }
            }

            // Create Razorpay order
            const options = {
                amount: Math.round(totalPrice * 100), // amount in the smallest currency unit (paise)
                currency: 'INR',
                receipt: `rcpt_${new Date().getTime()}`,
            };

            const rzOrder = await razorpay.orders.create(options);

            const holdTimeout = 12 * 60 * 1000; // 12 minutes hold

            const order = new Order({
                user: req.user._id,
                items: orderItems,
                shippingAddress,
                paymentMethod,
                totalAmount: totalPrice,
                razorpayOrderId: rzOrder.id,
                holdExpiresAt: new Date(Date.now() + holdTimeout),
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
                order.holdExpiresAt = undefined; // Clear hold

                // Decrement stock from Product model
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        if (item.size) {
                            const sizeIndex = product.sizes.findIndex(s => s.label === item.size);
                            if (sizeIndex !== -1) {
                                product.sizes[sizeIndex].stock -= item.qty;
                            }
                        } else {
                            product.stock -= item.qty;
                        }
                        await product.save();
                    }
                }

                const updatedOrder = await order.save();

                // Send WhatsApp notification
                const message = `Hi ${order.user.name}! Your order #${order._id} has been confirmed. Total: Rs. ${order.totalAmount}. Thank you for shopping with RUVA!`;
                const recipientPhone = order.shippingAddress?.whatsappNumber || order.user.phone;
                await sendWhatsApp(recipientPhone, message);

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
            const oldStatus = order.status;

            // 1. If moving TO cancelled, restore stock if it was previously taken (paid orders)
            if (status === 'cancelled' && oldStatus !== 'cancelled') {
                if (order.paymentStatus === 'paid') {
                    for (const item of order.items) {
                        const product = await Product.findById(item.product);
                        if (product) {
                            if (item.size) {
                                const sizeIndex = product.sizes.findIndex(s => s.label === item.size);
                                if (sizeIndex !== -1) {
                                    product.sizes[sizeIndex].stock += item.qty;
                                }
                            } else {
                                product.stock += item.qty;
                            }
                            await product.save();
                        }
                    }
                } else {
                    // If it was pending/unpaid, just clear the hold
                    order.holdExpiresAt = undefined;
                }
            }

            // 2. If moving OUT of cancelled (Rollback), check stock availability
            if (oldStatus === 'cancelled' && status !== 'cancelled') {
                // We only need to check stock if the order was paid (meaning it intends to take stock now)
                if (order.paymentStatus === 'paid') {
                    for (const item of order.items) {
                        const product = await Product.findById(item.product);
                        if (!product) {
                            res.status(404);
                            throw new Error(`Product not found: ${item.name}`);
                        }

                        // Find active holds
                        const activeHolds = await Order.find({
                            'items.product': item.product,
                            paymentStatus: 'pending',
                            holdExpiresAt: { $gt: new Date() }
                        });

                        let reservedQty = 0;
                        activeHolds.forEach(holdOrder => {
                            holdOrder.items.forEach(holdItem => {
                                if (holdItem.product.toString() === item.product.toString() && holdItem.size === item.size) {
                                    reservedQty += holdItem.qty;
                                }
                            });
                        });

                        let physicalStock = product.stock;
                        if (item.size) {
                            const sizeObj = product.sizes.find(s => s.label === item.size);
                            physicalStock = sizeObj ? sizeObj.stock : 0;
                        }

                        if (physicalStock - reservedQty < item.qty) {
                            res.status(400);
                            throw new Error('out of stock');
                        }
                    }

                    // If all available, decrement stock again
                    for (const item of order.items) {
                        const product = await Product.findById(item.product);
                        if (product) {
                            if (item.size) {
                                const sizeIndex = product.sizes.findIndex(s => s.label === item.size);
                                if (sizeIndex !== -1) {
                                    product.sizes[sizeIndex].stock -= item.qty;
                                }
                            } else {
                                product.stock -= item.qty;
                            }
                            await product.save();
                        }
                    }
                }
            }

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
                 const recipientPhone = order.shippingAddress?.whatsappNumber || order.user.phone;
                 await sendWhatsApp(recipientPhone, message);
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

// @desc    User refund request
// @route   POST /api/orders/:id/refund
// @access  Private
const requestRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid order id');
        }

        const order = await Order.findById(id).populate('user', 'name phone');

        if (!order || order.user._id.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Order not found');
        }

        const eligibility = ensureOrderRefundable(order);
        if (!eligibility.ok) {
            res.status(eligibility.code);
            throw new Error(eligibility.message);
        }

        if (!order.razorpayPaymentId) {
            res.status(400);
            throw new Error('No captured payment found for refund');
        }

        const { updatedOrder, refund } = await processRefund({
            order,
            reason,
            initiatedBy: 'user',
        });

        const message = `Hi ${order.user.name}, your refund for order #${order._id} is initiated. Refund reference: ${refund.id}.`;
        const recipientPhone = order.shippingAddress?.whatsappNumber || order.user.phone;
        await sendWhatsApp(recipientPhone, message);

        res.json({
            message: 'Refund initiated successfully',
            order: updatedOrder,
            refund,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Authorize admin for refund panel second step
// @route   POST /api/orders/admin-refund/authorize
// @access  Private/Admin
const authorizeAdminRefundPanel = async (req, res, next) => {
    try {
        if (
            process.env.NODE_ENV === 'production' &&
            (!process.env.ADMIN_REFUND_EMAIL || !process.env.ADMIN_REFUND_PASSWORD)
        ) {
            res.status(500);
            throw new Error('Refund panel credentials are not configured on server');
        }

        const { email, password } = req.body;

        if (email !== ADMIN_REFUND_LOGIN_EMAIL || password !== ADMIN_REFUND_LOGIN_PASSWORD) {
            res.status(401);
            console.log(`Failed refund panel login attempt with email: ${email}`);
            throw new Error('Invalid refund panel credentials');
        }

        const token = jwt.sign(
            { sub: req.user._id.toString(), role: 'admin', scope: 'admin_refund' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token, expiresIn: '15m' });
    } catch (error) {
        next(error);
    }
};

const verifyRefundAdminToken = (req) => {
    const token = req.headers[REFUND_AUTH_HEADER];
    if (!token) {
        return { ok: false, code: 401, message: 'Refund panel authorization is required' };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.scope !== 'admin_refund') {
            return { ok: false, code: 401, message: 'Invalid refund panel authorization token' };
        }
        return { ok: true };
    } catch (_error) {
        return { ok: false, code: 401, message: 'Refund panel authorization expired or invalid' };
    }
};

// @desc    Get order details for admin refund panel
// @route   GET /api/orders/admin-refund/:id
// @access  Private/Admin
const getRefundOrderDetails = async (req, res, next) => {
    try {
        const authStatus = verifyRefundAdminToken(req);
        if (!authStatus.ok) {
            res.status(authStatus.code);
            throw new Error(authStatus.message);
        }

        const { id } = req.params;
        if (!isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid order id');
        }

        const order = await Order.findById(id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        const eligibility = ensureOrderRefundable(order, { allowAdminOverride: true });

        res.json({
            order,
            refundable: eligibility.ok,
            refundMessage: eligibility.ok ? 'Order is eligible for admin refund' : eligibility.message,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process refund from admin refund panel
// @route   POST /api/orders/admin-refund/:id/process
// @access  Private/Admin
const processAdminRefund = async (req, res, next) => {
    try {
        const authStatus = verifyRefundAdminToken(req);
        if (!authStatus.ok) {
            res.status(authStatus.code);
            throw new Error(authStatus.message);
        }

        const { id } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid order id');
        }

        const order = await Order.findById(id).populate('user', 'name phone');
        const eligibility = ensureOrderRefundable(order, { allowAdminOverride: true });
        if (!eligibility.ok) {
            res.status(eligibility.code);
            throw new Error(eligibility.message);
        }

        if (!order.razorpayPaymentId) {
            res.status(400);
            throw new Error('No captured payment found for refund');
        }

        const { updatedOrder, refund } = await processRefund({
            order,
            reason,
            initiatedBy: 'admin',
        });

        const message = `Hi ${order.user.name}, your refund for order #${order._id} was initiated by support. Refund reference: ${refund.id}.`;
        const recipientPhone = order.shippingAddress?.whatsappNumber || order.user.phone;
        await sendWhatsApp(recipientPhone, message);
g
        res.json({
            message: 'Admin refund initiated successfully',
            order: updatedOrder,
            refund,
        });
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
    requestRefund,
    authorizeAdminRefundPanel,
    getRefundOrderDetails,
    processAdminRefund,
};
