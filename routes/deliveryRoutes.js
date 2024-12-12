const express = require('express');
const {
    getUnassignedDeliveries,
    assignDelivery,
    updateDeliveryStatus,
    getDriverDeliveries,
  } = require('../controllers/deliveryController');  
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Routes
router.get('/unassigned', auth, role('delivery_person'), getUnassignedDeliveries);
router.get('/', auth, role('delivery_person'), getDriverDeliveries);
router.put('/:id/assign', auth, role('delivery_person'), assignDelivery);
router.put('/:id/status', auth, role('delivery_person'), updateDeliveryStatus);


module.exports = router;
