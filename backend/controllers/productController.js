const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const pageSize = 10;
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

        if (req.query.category) filter.category = req.query.category;
        if (req.query.fabric) filter.fabric = req.query.fabric;

        const count = await Product.countDocuments({ ...filter });
        const products = await Product.find({ ...filter })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
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
            res.json(product);
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
        } = req.body;

        const images = req.files ? req.files.map((file) => ({
            url: file.path || file.secure_url || file.url,
            publicId: file.filename || file.public_id,
        })) : [];

        const parsedSizes = sizes ? JSON.parse(sizes) : [];
        const parsedTags = tags ? JSON.parse(tags) : [];
        const parsedColors = colors ? JSON.parse(colors) : [];

        const product = new Product({
            name,
            slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
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
            isFeatured: isFeatured === 'true',
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
            
            if (sizes) product.sizes = JSON.parse(sizes);
            if (tags) product.tags = JSON.parse(tags);
            if (colors) product.colors = JSON.parse(colors);

            if (req.files && req.files.length > 0) {
                const newImages = req.files.map((file) => ({
                    url: file.path,
                    publicId: file.filename,
                }));
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
