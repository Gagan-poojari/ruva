const Product = require('../models/Product');
const { normalizeSize } = require('../utils/orderStockUtils');

const adjustProductStock = (product, color, size, qtyToDeduct) => {
    if (color && product.colorVariants && product.colorVariants.length > 0) {
        const variantIndex = product.colorVariants.findIndex(
            (v) => v.colorName.toLowerCase() === color.toLowerCase()
        );
        if (variantIndex !== -1) {
            const variant = product.colorVariants[variantIndex];
            const normalizedSize = normalizeSize(size);
            if (normalizedSize && variant.sizes && variant.sizes.length > 0) {
                const sizeIndex = variant.sizes.findIndex((s) => s.label === normalizedSize);
                if (sizeIndex !== -1) {
                    variant.sizes[sizeIndex].stock -= qtyToDeduct;
                    variant.stock = variant.sizes.reduce((acc, curr) => acc + curr.stock, 0);
                }
            } else {
                variant.stock -= qtyToDeduct;
            }
            product.stock = product.colorVariants.reduce((acc, curr) => acc + curr.stock, 0);
            product.markModified('colorVariants');
            return;
        }
    }

    const normalizedSize = normalizeSize(size);
    if (normalizedSize && product.sizes && product.sizes.length > 0) {
        const sizeIndex = product.sizes.findIndex((s) => s.label === normalizedSize);
        if (sizeIndex !== -1) {
            product.sizes[sizeIndex].stock -= qtyToDeduct;
            product.stock = product.sizes.reduce((acc, curr) => acc + curr.stock, 0);
            product.markModified('sizes');
            return;
        }
    }

    product.stock -= qtyToDeduct;
};

const settlePaidOrder = async ({ order, razorpayPaymentId }) => {
    if (order.paymentStatus === 'paid') {
        return order;
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpayPaymentId;
    order.holdExpiresAt = undefined;

    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            adjustProductStock(product, item.color, item.size, item.qty);
            await product.save();
        }
    }

    return order.save();
};

module.exports = { settlePaidOrder };
