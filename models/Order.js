// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'in progress', 'completed', 'cancelled'], default: 'pending' },
  deliveryDetails: {
    fromAddress: { type: String, required: true }, // Seller's address
    toAddress: { type: String, required: true }, // Vendor's address
    contact: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
