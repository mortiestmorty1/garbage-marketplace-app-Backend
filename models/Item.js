// models/Item.js
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['plastic', 'metal', 'glass', 'paper', 'other'] },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' }, // URL to the item's image
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true }, // Seller's address
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
