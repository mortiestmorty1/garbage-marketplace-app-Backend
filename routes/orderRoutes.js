// routes/orderRoutes.js
const express = require('express');
const { 
    placeOrder, 
    getOrders, 
    updateOrderStatus, 
    assignDeliveryPerson,
    getAllOrders, 
    getVendorOrders, 
    getSellerOrders 
} = require('../controllers/orderController');

const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Vendor-specific route
router.post('/', auth, role('vendor'), placeOrder);

// Common route for buyers and sellers
router.get('/', auth, getOrders);

// Admin route to update order status
router.put('/:id/status', auth, role('admin'), updateOrderStatus);

router.put('/:id/assign-delivery', auth, role('admin'), assignDeliveryPerson);

router.get('/admin/all', auth, role('admin'), getAllOrders);

router.get('/vendor', auth, role('vendor'), getVendorOrders);

router.get('/seller', auth, role('seller'), getSellerOrders);

module.exports = router;
