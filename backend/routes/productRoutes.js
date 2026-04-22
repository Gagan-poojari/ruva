const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const { parser } = require('../config/cloudinary');

router.route('/')
    .get(getProducts)
    .post(protect, admin, parser.array('images', 5), createProduct);

router.route('/:id/reviews').post(protect, createProductReview);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, parser.array('images', 5), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
