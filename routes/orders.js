const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Donation = require('../models/Donation');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { donationId, quantity, pickupTime, notes, orderType, deliveryAddress, deliveryTime } = req.body;

    // Validate required fields
    if (!donationId || !quantity) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Validate order type specific fields
    if (orderType === 'pickup' && !pickupTime) {
      return res.status(400).json({ msg: 'Please provide pickup time for pickup orders' });
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress) {
        return res.status(400).json({ msg: 'Please provide delivery address for delivery orders' });
      }
      
      // Validate delivery address fields
      const { street, city, state, zipCode, coordinates } = deliveryAddress;
      if (!street || !city || !state || !zipCode) {
        return res.status(400).json({ msg: 'Please provide complete delivery address (street, city, state, zipCode)' });
      }
      
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        return res.status(400).json({ msg: 'Please provide coordinates for delivery address' });
      }
      
      if (!deliveryTime) {
        return res.status(400).json({ msg: 'Please provide delivery time for delivery orders' });
      }
    }

    // Check if donation exists and has enough quantity
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    if (donation.quantity < quantity) {
      return res.status(400).json({ msg: 'Not enough quantity available' });
    }

    // Create new order with order type specific fields
    const orderData = {
      user: req.user.id,
      donation: donationId,
      quantity,
      notes,
      orderType: orderType || 'pickup' // Default to pickup if not specified
    };

    // Add order type specific fields
    if (orderType === 'pickup' || !orderType) {
      orderData.pickupTime = pickupTime;
    } else if (orderType === 'delivery') {
      // Ensure all required delivery fields are present
      orderData.deliveryAddress = {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode,
        coordinates: {
          lat: deliveryAddress.coordinates.lat,
          lng: deliveryAddress.coordinates.lng
        }
      };
      orderData.deliveryTime = deliveryTime;
    }

    const newOrder = new Order(orderData);

    // Update donation quantity
    donation.quantity -= quantity;
    await donation.save();

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders
// @desc    Get all orders for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('donation', 'name description imageUrl organization')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/user
// @desc    Get all orders for current user with donation details
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'donation',
        select: 'title description images quantity location pickupDate donor',
        populate: {
          path: 'donor',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('donation', 'name description imageUrl organization quantity')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // If cancelling, return quantity to donation
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const donation = await Donation.findById(order.donation);
      if (donation) {
        donation.quantity += order.quantity;
        await donation.save();
      }
    }

    // Define valid status transitions for better flow control
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['ready', 'cancelled'],
      'ready': ['in-transit', 'cancelled'],
      'in-transit': ['delivered', 'cancelled'],
      'delivered': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    // Check if the status transition is valid
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        msg: `Cannot change order status from '${order.status}' to '${status}'. Valid transitions are: ${validTransitions[order.status].join(', ')}` 
      });
    }

    // Additional validation for delivery orders
    if (order.orderType === 'delivery') {
      // Ensure delivery address is complete before moving to in-transit
      if (status === 'in-transit') {
        const { deliveryAddress } = order;
        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || 
            !deliveryAddress.state || !deliveryAddress.zipCode || 
            !deliveryAddress.coordinates || !deliveryAddress.coordinates.lat || 
            !deliveryAddress.coordinates.lng) {
          return res.status(400).json({ msg: 'Order must have a complete delivery address before being in-transit' });
        }
      }
    }

    // Save previous status for notification
    const previousStatus = order.status;
    
    // Update order status
    order.status = status;
    order.updatedAt = Date.now();
    await order.save();
    
    // Create notification for status change
    try {
      const Notification = require('../models/Notification');
      
      // Define notification messages based on status
      const statusMessages = {
        'confirmed': 'Your order has been confirmed and is being processed.',
        'ready': 'Your order is ready for pickup or delivery.',
        'in-transit': 'Your order is now in transit and will be delivered to your address soon.',
        'delivered': 'Your order has been delivered to your address.',
        'completed': 'Your order has been completed. Thank you for using our service!',
        'cancelled': 'Your order has been cancelled.'
      };
      
      if (statusMessages[status]) {
        const notification = new Notification({
          user: order.user,
          type: 'system',
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: statusMessages[status],
          relatedTo: {
            item: order._id,
            model: 'donation'
          }
        });
        
        await notification.save();
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      // Continue with response even if notification fails
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // If order is not cancelled, return quantity to donation
    if (order.status !== 'cancelled') {
      const donation = await Donation.findById(order.donation);
      if (donation) {
        donation.quantity += order.quantity;
        await donation.save();
      }
    }

    await order.remove();
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status (for delivery orders)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Validate status transitions for delivery orders
    if (order.orderType === 'delivery') {
      // Only allow transition to in-transit if order is confirmed or ready
      if (status === 'in-transit' && !['confirmed', 'ready'].includes(order.status)) {
        return res.status(400).json({ msg: 'Order must be confirmed or ready before being in-transit' });
      }
      
      // Only allow transition to delivered if order is in-transit
      if (status === 'delivered' && order.status !== 'in-transit') {
        return res.status(400).json({ msg: 'Order must be in-transit before being delivered' });
      }
    } else {
      return res.status(400).json({ msg: 'This endpoint is only for delivery orders' });
    }

    order.status = status;
    order.updatedAt = Date.now();

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/orders/:id/complete
// @desc    Mark order as completed (for pickup orders)
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (order.orderType !== 'pickup') {
      return res.status(400).json({ msg: 'This endpoint is only for pickup orders' });
    }

    if (order.status !== 'ready') {
      return res.status(400).json({ msg: 'Order must be ready for pickup before being completed' });
    }

    order.status = 'completed';
    order.updatedAt = Date.now();

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;