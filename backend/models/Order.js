const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
                qty: { type: Number, required: true },
                price: { type: Number, required: true },
                size: { type: String },
            },
        ],
        shippingAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            default: 'Razorpay',
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        totalAmount: {
            type: Number,
            required: true,
            default: 0.0,
        },
        deliveryFee: {
            type: Number,
            default: 49,
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        holdExpiresAt: {
            type: Date,
            index: true,
        },
        refundId: {
            type: String,
        },
        refundReason: {
            type: String,
            default: '',
        },
        refundInitiatedBy: {
            type: String,
            enum: ['user', 'admin', ''],
            default: '',
        },
        refundedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Order', orderSchema);
