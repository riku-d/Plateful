const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const donationCount = await Donation.countDocuments();
    const organizationCount = await Organization.countDocuments();
    const requestCount = await Order.countDocuments();
    const OrganizationApplication = require('../models/OrganizationApplication');
    const pendingApplicationsCount = await OrganizationApplication.countDocuments({ status: 'pending' });

    res.json({
      users: userCount,
      donations: donationCount,
      organizations: organizationCount,
      requests: requestCount,
      pendingApplications: pendingApplicationsCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users (with pagination and filtering)
// @access  Private (Admin only)
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  auth,
  adminAuth,
  check('role', 'Role is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { role } = req.body;

  // Validate role
  const validRoles = ['donor', 'recipient', 'volunteer', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't allow admin to change their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Admin cannot change their own role' });
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/verify
// @desc    Verify or unverify a user
// @access  Private (Admin only)
router.put('/users/:id/verify', [
  auth,
  adminAuth,
  check('isVerified', 'Verification status is required').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { isVerified } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isVerified = isVerified;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Admin cannot delete themselves' });
    }

    await user.remove();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/orders
// @desc    Get all orders (with pagination and filtering)
// @access  Private (Admin only)
router.get('/orders', [auth, adminAuth], async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('donation', 'title description images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/orders/:id/approve
// @desc    Approve order for delivery (change status from 'ready' to 'in-transit')
// @access  Private (Admin only)
router.put('/orders/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order is in 'ready' status
    if (order.status !== 'ready') {
      return res.status(400).json({ msg: 'Only orders with status "ready" can be approved for delivery' });
    }

    // Update order status to 'in-transit'
    order.status = 'in-transit';
    order.updatedAt = Date.now();

    await order.save();

    // Create notification for the user
    const Notification = require('../models/Notification');
    const notification = new Notification({
      user: order.user._id,
      type: 'system',
      title: 'Order In Transit',
      message: `Your order for ${order.quantity} item(s) is now in transit and will be delivered to your address soon.`,
      relatedTo: {
        item: order._id,
        model: 'order'
      }
    });

    await notification.save();
    
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