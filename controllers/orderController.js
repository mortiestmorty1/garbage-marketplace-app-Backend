// controllers/orderController.js
const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const Delivery = require('../models/Delivery');


exports.placeOrder = async (req, res) => {
  const { itemId, deliveryDetails } = req.body;

  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can place orders' });
    }

    // Fetch the item
    const item = await Item.findById(itemId);
    if (!item || item.status !== 'available') {
      return res.status(400).json({ message: 'Item is not available for purchase' });
    }

    // Fetch the seller
    const seller = await User.findById(item.sellerId);
    if (!seller || !seller.profileDetails?.address) {
      return res.status(400).json({ message: 'Seller address not available' });
    }

    // Fetch the vendor
    const vendor = await User.findById(req.user.userId);
    if (!vendor || !vendor.profileDetails?.address) {
      return res.status(400).json({ message: 'Vendor address not available' });
    }

    // Create the order
    const order = await Order.create({
      buyerId: req.user.userId,
      sellerId: item.sellerId,
      itemId: item._id,
      deliveryDetails: {
        fromAddress: seller.profileDetails.address,
        toAddress: vendor.profileDetails.address,
        contact: deliveryDetails.contact,
      },
    });

    // Update the item status
    item.status = 'sold';
    await item.save();

    // Create a delivery object
    const delivery = await Delivery.create({
      orderId: order._id,
      status: 'unassigned', // Default status
    });

    res.status(201).json({ message: 'Order placed successfully', order, delivery });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyerId: req.user.userId }, { sellerId: req.user.userId }],
    }).populate([
      {
        path: 'buyerId',
        select: 'name email profileDetails.address',
      },
      {
        path: 'sellerId',
        select: 'name email profileDetails.address',
      },
      {
        path: 'itemId',
        select: 'name price',
      },
    ]);

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};


exports.assignDeliveryPerson = async (req, res) => {
  const { deliveryPersonId } = req.body;
  const { id: orderId } = req.params;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign delivery persons' });
    }

    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || deliveryPerson.role !== 'delivery_person') {
      return res.status(400).json({ message: 'Invalid delivery person' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryPersonId },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json({ message: 'Delivery person assigned successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning delivery person', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all orders' });
    }

    const orders = await Order.find().populate(['buyerId', 'sellerId', 'itemId', 'deliveryPersonId']);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can track their orders' });
    }

    const orders = await Order.find({ buyerId: req.user.userId }).populate(['sellerId', 'itemId', 'deliveryPersonId']);

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vendor orders', error: err.message });
  }
};
exports.getSellerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can monitor their sold items' });
    }

    const orders = await Order.find({ sellerId: req.user.userId })
      .populate([
        { path: 'buyerId', select: 'name email profileDetails.address' },
        { path: 'itemId', select: 'name price' },
        { path: 'deliveryPersonId', select: 'name email' },
      ]);

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching seller orders:', err.message);
    res.status(500).json({ message: 'Error fetching seller orders', error: err.message });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
      const order = await Order.findByIdAndUpdate(
          req.params.id, 
          { status: req.body.status }, 
          { new: true }
      );
      if (!order) return res.status(404).json({ message: 'Order not found' });

      res.status(200).json({ message: 'Order status updated', order });
  } catch (err) {
      res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
};
