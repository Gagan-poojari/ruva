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
        whatsappSent: {
            type: Boolean,
            default: false,
        },
        totalAmount: {
            type: Number,
            required: true,
            default: 0.0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Order', orderSchema);
