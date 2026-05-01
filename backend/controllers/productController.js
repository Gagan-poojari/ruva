const Product = require('../models/Product');
const Order = require('../models/Order');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs/promises');

const CLOUDINARY_TIMEOUT_MS = 2 * 60 * 1000;

const withTimeout = (promise, timeoutMs, message) =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
        promise
            .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });

const parseJsonArray = (value, fallback = []) => {
    if (!value) return fallback;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
};

const uploadImagesToCloudinary = async (files = []) => {
    const uploadedImages = [];

    for (const file of files) {
        let uploadResult;
        try {
            const isCloudinaryResult = file?.secure_url && (file?.public_id || file?.filename);

            if (isCloudinaryResult) {
                uploadedImages.push({
                    url: file.secure_url || file.url,
                    publicId: file.public_id || file.filename,
                });
                continue;
            }

            uploadResult = await withTimeout(
                cloudinary.uploader.upload(file.path, {
                    folder: 'saree-shop',
                    resource_type: 'image',
                }),
                CLOUDINARY_TIMEOUT_MS,
                'Cloudinary product image upload timed out'
            );

            uploadedImages.push({
                url: uploadResult.secure_url || uploadResult.url,
                publicId: uploadResult.public_id || uploadResult.asset_id,
            });
        } finally {
            if (file?.path) {
                try {
                    await fs.unlink(file.path);
                } catch {
                    // ignore temp-file cleanup errors
                }
            }
        }
    }

    return uploadedImages.filter((image) => Boolean(image.url) && Boolean(image.publicId));
};

const buildColorVariants = async (rawVariants, files = []) => {
    const variants = Array.isArray(rawVariants) ? rawVariants : [];
    const colorVariants = [];

    for (let idx = 0; idx < variants.length; idx += 1) {
        const variant = variants[idx];
        const variantFiles = files.filter((file) => file.fieldname === `variantImages_${idx}`);
        const uploadedVariantImages = await uploadImagesToCloudinary(variantFiles);
        const variantImages = [
            ...(Array.isArray(variant?.images) ? variant.images : []),
            ...uploadedVariantImages,
        ];
        const variantSizes = Array.isArray(variant?.sizes) ? variant.sizes : [];

        colorVariants.push({
            colorName: variant?.colorName || `Color ${idx + 1}`,
            colorHex: variant?.colorHex || '#cccccc',
            images: variantImages,
            stock: Number(variant?.stock || 0),
            price: Number(variant?.price || 0),
            discountPrice: Number(variant?.discountPrice || 0),
            sizes: variantSizes,
        });
    }

    return colorVariants;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const pageSize = Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                  name: {
                      $regex: req.query.keyword,
                      $options: 'i',
                  },
              }
            : {};

        const filter = { ...keyword };

        if (req.query.category) {
            const raw = String(req.query.category).trim();
            if (raw) filter.category = { $regex: `^${escapeRegex(raw)}$`, $options: 'i' };
        }
        if (req.query.fabric) {
            const raw = String(req.query.fabric).trim();
            if (raw) filter.fabric = { $regex: `^${escapeRegex(raw)}$`, $options: 'i' };
        }
        if (req.query.isFeatured) {
            filter.isFeatured = req.query.isFeatured === 'true';
        }
        if (req.query.isBestseller) {
            filter.isBestseller = req.query.isBestseller === 'true';
        }
        if (req.query.isTrending) {
            filter.isTrending = req.query.isTrending === 'true';
        }

        const count = await Product.countDocuments({ ...filter });
        const products = await Product.find({ ...filter })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Calculate effective stock (subtracting active holds)
        const productsWithHoldInfo = await Promise.all(products.map(async (product) => {
            const activeHolds = await Order.find({
                'items.product': product._id,
                paymentStatus: 'pending',
                holdExpiresAt: { $gt: new Date() }
            });

            const p = product.toObject();
            
            if (p.sizes && p.sizes.length > 0) {
                p.sizes = p.sizes.map(size => {
                    let reserved = 0;
                    activeHolds.forEach(hold => {
                        hold.items.forEach(item => {
                            if (item.product.toString() === product._id.toString() && item.size === size.label) {
                                reserved += item.qty;
                            }
                        });
                    });
                    return { ...size, stock: Math.max(0, size.stock - reserved) };
                });
                // Also update top-level stock if it exists as a sum
                p.stock = p.sizes.reduce((acc, curr) => acc + curr.stock, 0);
            } else {
                let reserved = 0;
                activeHolds.forEach(hold => {
                    hold.items.forEach(item => {
                        if (item.product.toString() === product._id.toString()) {
                            reserved += item.qty;
                        }
                    });
                });
                p.stock = Math.max(0, p.stock - reserved);
            }
            return p;
        }));

        res.json({ products: productsWithHoldInfo, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            const activeHolds = await Order.find({
                'items.product': product._id,
                paymentStatus: 'pending',
                holdExpiresAt: { $gt: new Date() }
            });

            const p = product.toObject();
            
            if (p.sizes && p.sizes.length > 0) {
                p.sizes = p.sizes.map(size => {
                    let reserved = 0;
                    activeHolds.forEach(hold => {
                        hold.items.forEach(item => {
                            if (item.product.toString() === product._id.toString() && item.size === size.label) {
                                reserved += item.qty;
                            }
                        });
                    });
                    return { ...size, stock: Math.max(0, size.stock - reserved) };
                });
                p.stock = p.sizes.reduce((acc, curr) => acc + curr.stock, 0);
            } else {
                let reserved = 0;
                activeHolds.forEach(hold => {
                    hold.items.forEach(item => {
                        if (item.product.toString() === product._id.toString()) {
                            reserved += item.qty;
                        }
                    });
                });
                p.stock = Math.max(0, p.stock - reserved);
            }

            res.json(p);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            description,
            category,
            fabric,
            occasion,
            price,
            discountPrice,
            stock,
            sizes,
            tags,
            colors,
            isFeatured,
            isBestseller,
            isTrending,
        } = req.body;

        if (!name || !description || !category) {
            res.status(400);
            throw new Error('Name, description, and category are required');
        }

        const baseFiles = (req.files || []).filter((file) => file.fieldname === 'images');
        const images = await uploadImagesToCloudinary(baseFiles);

        const parsedSizes = parseJsonArray(sizes);
        const parsedTags = parseJsonArray(tags);
        const parsedColors = parseJsonArray(colors);
        const parsedColorVariants = await buildColorVariants(parseJsonArray(req.body.colorVariants), req.files || []);

        const product = new Product({
            name,
            slug: slug || String(name).toLowerCase().replace(/\s+/g, '-'),
            description,
            category,
            fabric,
            occasion,
            price,
            discountPrice,
            stock,
            images,
            sizes: parsedSizes,
            tags: parsedTags,
            colors: parsedColors,
            colorVariants: parsedColorVariants,
            isFeatured: isFeatured === 'true',
            isBestseller: isBestseller === 'true',
            isTrending: isTrending === 'true',
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const {
            name,
            slug,
            description,
            category,
            fabric,
            occasion,
            price,
            discountPrice,
            stock,
            sizes,
            tags,
            colors,
            isFeatured,
            isBestseller,
            isTrending,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            if (slug) product.slug = slug;
            product.description = description || product.description;
            product.category = category || product.category;
            product.fabric = fabric || product.fabric;
            product.occasion = occasion || product.occasion;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.stock = stock || product.stock;
            product.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured;
            product.isBestseller = isBestseller !== undefined ? isBestseller === 'true' : product.isBestseller;
            product.isTrending = isTrending !== undefined ? isTrending === 'true' : product.isTrending;
            
            if (sizes) product.sizes = parseJsonArray(sizes);
            if (tags) product.tags = parseJsonArray(tags);
            if (colors) product.colors = parseJsonArray(colors);
            if (req.body.colorVariants) {
                product.colorVariants = await buildColorVariants(parseJsonArray(req.body.colorVariants), req.files || []);
            }

            if (req.files && req.files.length > 0) {
                const baseFiles = req.files.filter((file) => file.fieldname === 'images');
                const newImages = await uploadImagesToCloudinary(baseFiles);
                product.images = [...product.images, ...newImages];
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Remove images from cloudinary
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    try {
                        await cloudinary.uploader.destroy(image.publicId);
                    } catch (err) {
                        console.error(`Failed to delete image ${image.publicId} from Cloudinary:`, err.message);
                    }
                }
            }

            if (product.colorVariants && product.colorVariants.length > 0) {
                for (const variant of product.colorVariants) {
                    for (const image of variant.images || []) {
                        try {
                            await cloudinary.uploader.destroy(image.publicId);
                        } catch (err) {
                            console.error(`Failed to delete variant image ${image.publicId} from Cloudinary:`, err.message);
                        }
                    }
                }
            }
            
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};
// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('Product already reviewed');
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
};
