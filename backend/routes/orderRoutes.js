const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    verifyPayment,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    requestRefund,
    authorizeAdminRefundPanel,
    getRefundOrderDetails,
    processAdminRefund,
    cancelMyOrder,
    getRazorpayKey,
    retryPaymentForOrder,
    razorpayWebhook,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);
    
router.route('/my').get(protect, getMyOrders);
router.route('/verify').post(protect, verifyPayment);
router.route('/razorpay/webhook').post(razorpayWebhook);
router.route('/razorpay-key').get(protect, getRazorpayKey);
router.route('/:id/retry-payment').post(protect, retryPaymentForOrder);
router.route('/:id/refund').post(protect, requestRefund);
router.route('/:id/cancel').post(protect, cancelMyOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/admin-refund/authorize').post(protect, admin, authorizeAdminRefundPanel);
router.route('/admin-refund/:id').get(protect, admin, getRefundOrderDetails);
router.route('/admin-refund/:id/process').post(protect, admin, processAdminRefund);

module.exports = router;
