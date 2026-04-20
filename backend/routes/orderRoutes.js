const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    verifyPayment,
    getMyOrders,
    getOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);
    
router.route('/my').get(protect, getMyOrders);
router.route('/verify').post(protect, verifyPayment);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;
