/**
 * Stock / pricing helpers for checkout (used by guest checkout only).
 * Authenticated order flow keeps its own copies in orderController.js.
 */

const Order = require('../models/Order');
const Product = require('../models/Product');

const normalizeSize = (size) => {
    if (!size || size === 'Free Size') return undefined;
    return size;
};

/** Size persisted on the order document (always stored for admin/display). */
const getStoredSize = (size) => {
    if (!size || size === 'Free Size') return 'Free Size';
    return String(size).trim();
};

const getEffectiveProductPrice = (product, color) => {
    if (color && product.colorVariants && product.colorVariants.length > 0) {
        const variant = product.colorVariants.find(
            (v) => v.colorName.toLowerCase() === color.toLowerCase()
        );
        if (variant && variant.price > 0) {
            return variant.discountPrice && variant.discountPrice > 0 && variant.discountPrice < variant.price
                ? variant.discountPrice
                : variant.price;
        }
    }
    return product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
};

const getProductStockInfo = (product, color, size) => {
    if (color && product.colorVariants && product.colorVariants.length > 0) {
        const variant = product.colorVariants.find(
            (v) => v.colorName.toLowerCase() === color.toLowerCase()
        );
        if (variant) {
            const normalizedSize = normalizeSize(size);
            if (normalizedSize && variant.sizes && variant.sizes.length > 0) {
                const sizeObj = variant.sizes.find((s) => s.label === normalizedSize);
                return {
                    stock: sizeObj ? sizeObj.stock : 0,
                };
            }
            return { stock: variant.stock };
        }
    }

    const normalizedSize = normalizeSize(size);
    if (normalizedSize && product.sizes && product.sizes.length > 0) {
        const sizeObj = product.sizes.find((s) => s.label === normalizedSize);
        return { stock: sizeObj ? sizeObj.stock : 0 };
    }

    return { stock: product.stock };
};

const buildVerifiedOrderItems = async (orderItems) => {
    if (!orderItems || orderItems.length === 0) {
        return { ok: false, code: 400, message: 'No order items' };
    }

    let verifiedTotal = 0;
    const verifiedOrderItems = [];

    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            return { ok: false, code: 404, message: `Product not found: ${item.product}` };
        }

        const normalizedSize = normalizeSize(item.size);
        const dbPrice = getEffectiveProductPrice(product, item.color);

        const clientPriceInPaise = Math.round(Number(item.price) * 100);
        const dbPriceInPaise = Math.round(Number(dbPrice) * 100);
        if (clientPriceInPaise !== dbPriceInPaise) {
            return {
                ok: false,
                code: 400,
                message: `Price mismatch for ${product.name}. Please refresh your cart.`,
            };
        }

        verifiedTotal += dbPrice * (item.qty || 1);

        const activeHolds = await Order.find({
            'items.product': item.product,
            paymentStatus: 'pending',
            holdExpiresAt: { $gt: new Date() },
        });

        let reservedQty = 0;
        activeHolds.forEach((holdOrder) => {
            holdOrder.items.forEach((holdItem) => {
                const sameProduct = holdItem.product.toString() === item.product.toString();
                const sameColor =
                    String(holdItem.color || '').toLowerCase() === String(item.color || '').toLowerCase();
                const sameSize =
                    String(normalizeSize(holdItem.size) || '').toLowerCase() ===
                    String(normalizeSize(item.size) || '').toLowerCase();

                if (sameProduct && sameColor && sameSize) {
                    reservedQty += holdItem.qty;
                }
            });
        });

        const stockInfo = getProductStockInfo(product, item.color, item.size);
        if (stockInfo.stock - reservedQty < item.qty) {
            return { ok: false, code: 400, message: `"${product.name}" is out of stock` };
        }

        verifiedOrderItems.push({
            product: item.product,
            qty: item.qty,
            price: dbPrice,
            size: getStoredSize(item.size),
            color: item.color,
        });
    }

    return { ok: true, verifiedOrderItems, verifiedTotal };
};

module.exports = {
    normalizeSize,
    getStoredSize,
    buildVerifiedOrderItems,
};
