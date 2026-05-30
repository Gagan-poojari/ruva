const express = require('express');
const router = express.Router();
const { lookupPincode } = require('../controllers/locationController');

router.get('/pincode/:pincode', lookupPincode);

module.exports = router;
