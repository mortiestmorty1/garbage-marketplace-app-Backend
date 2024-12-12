// controllers/deliveryController.js
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

exports.getUnassignedDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPersonId: null, status: 'unassigned' }).populate({
      path: 'orderId',
      populate: {
        path: 'itemId',
        select: 'name price',
      },
    });
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unassigned deliveries', error: err.message });
  }
};


exports.assignDelivery = async (req, res) => {
  const { id: deliveryId } = req.params;

  try {
    const delivery = await Delivery.findOneAndUpdate(
      { _id: deliveryId, deliveryPersonId: null, status: 'unassigned' },
      { deliveryPersonId: req.user.userId, status: 'accepted' }, // Set to 'accepted'
      { new: true }
    ).populate({
      path: 'orderId',
      populate: {
        path: 'itemId',
        select: 'name price',
      },
    });

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not available or already accepted.' });
    }

    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: 'Error accepting delivery', error: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const { id: deliveryId } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['accepted', 'assigned', 'picked up', 'delivered', 'cancelled', 'unassigned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Update delivery status
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status },
      { new: true }
    ).populate('orderId');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    // Update corresponding order status
    const order = await Order.findById(delivery.orderId._id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (status === 'delivered') {
      order.status = 'completed';
    } else if (status === 'cancelled') {
      order.status = 'cancelled';
    } else if (status === 'picked up') {
      order.status = 'in progress';
    } else if (status === 'unassigned') {
      order.status = 'pending';
    }

    await order.save();

    res.status(200).json({ message: 'Delivery and Order status updated successfully', delivery, order });
  } catch (err) {
    console.error('Error updating delivery status:', err.message);
    res.status(500).json({ message: 'Error updating delivery status', error: err.message });
  }
};



const populateOptions = {
  path: 'orderId',
  populate: [
    { path: 'itemId', select: 'name price' },
    { path: 'deliveryDetails' }, // Ensure deliveryDetails is populated
  ],
};


exports.getDriverDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPersonId: req.user.userId }).populate(populateOptions);
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deliveries', error: err.message });
  }
};

