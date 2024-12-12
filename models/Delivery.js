const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Allows for unassigned deliveries
  },
  status: {
    type: String,
    enum: ['unassigned','accepted', 'assigned', 'picked up', 'in transit', 'delivered', 'cancelled'],
    default: 'unassigned',
  },
  pickupTime: {
    type: Date,
    default: null,
  },
  deliveryTime: {
    type: Date,
    default: null,
  },
  charges: {
    type: Number,
    default: 0,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Delivery', DeliverySchema);
