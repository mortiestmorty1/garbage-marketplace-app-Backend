const express = require('express');
const { createItem, getItems, getItem, updateItem, deleteItem, uploadItemImage,getOwnListings,getItemStatuses } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// Public routes
router.get('/status', auth, role('seller'), getItemStatuses);
router.get('/own', auth, role('seller'), getOwnListings);
router.get('/', getItems);
router.get('/:id', getItem);


// Protected routes for sellers
router.post('/', auth, role('seller'), uploadItemImage, createItem);
router.put('/:id', auth, role('seller'), uploadItemImage, updateItem);
router.delete('/:id', auth, role('seller'), deleteItem);




module.exports = router;
