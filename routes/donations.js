const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/donations
// @desc    Get all donations with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      foodType,
      status,
      location,
      radius,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: { $ne: 'expired' } };

    // Filter by food type
    if (foodType) {
      query.foodType = foodType;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by location and radius
    if (location && radius) {
      const [lat, lng] = location.split(',').map(Number);
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(radius) * 1609.34 // miles → meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'name rating')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(Array.isArray(donations) ? donations : []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name rating profileImage')
      .populate('reservedBy', 'name phone')
      .populate('pickedUpBy', 'name phone');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Private
router.post('/', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('foodType', 'Food type is required').isIn([
    'fruits', 'vegetables', 'dairy', 'meat',
    'grains', 'baked-goods', 'canned-goods',
    'frozen', 'other'
  ]),
  body('quantity.amount', 'Quantity amount is required').isNumeric(),
  body('quantity.unit', 'Quantity unit is required').isIn([
    'lbs', 'kg', 'pieces', 'packages', 'containers', 'other'
  ]),
  body('expirationDate', 'Expiration date is required').isISO8601(),
  body('pickupDate', 'Pickup date is required').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      foodType,
      quantity,
      expirationDate,
      pickupDate,
      pickupTime,
      location,
      images,
      dietaryRestrictions,
      allergens,
      isRefrigerated,
      isFrozen,
      tags,
      estimatedValue,
      isUrgent
    } = req.body;

    const newDonation = new Donation({
      donor: req.user.id,
      title,
      description,
      foodType,
      quantity,
      expirationDate,
      pickupDate,
      pickupTime,
      location,
      images: images || [],
      dietaryRestrictions: dietaryRestrictions || [],
      allergens: allergens || [],
      isRefrigerated: isRefrigerated || false,
      isFrozen: isFrozen || false,
      tags: tags || [],
      estimatedValue,
      isUrgent: isUrgent || false
    });

    const donation = await newDonation.save();
    await donation.populate('donor', 'name rating');

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (donor only)
router.put('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.donor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Cannot update donation that is not available' });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('donor', 'name rating');

    res.json(updatedDonation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private (donor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.donor.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/reserve
// @desc    Reserve a donation
// @access  Private
router.post('/:id/reserve', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is not available' });
    }

    if (donation.donor.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot reserve your own donation' });
    }

    donation.status = 'reserved';
    donation.reservedBy = req.user.id;
    donation.reservedAt = new Date();

    // Create an order for this reservation
    const Order = require('../models/Order');
    const newOrder = new Order({
      user: req.user.id,
      donation: donation._id,
      quantity: 1,
      orderType: 'pickup',
      pickupTime: donation.pickupDate,
      status: 'pending'
    });

    await newOrder.save();
    await donation.save();
    await donation.populate('donor', 'name rating');
    await donation.populate('reservedBy', 'name phone');

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/pickup
// @desc    Mark donation as picked up
// @access  Private
router.post('/:id/pickup', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (donation.status !== 'reserved') {
      return res.status(400).json({ message: 'Donation must be reserved first' });
    }

    if (donation.reservedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    donation.status = 'picked-up';
    donation.pickedUpBy = req.user.id;
    donation.pickedUpAt = new Date();

    await donation.save();
    await donation.populate('donor', 'name rating');
    await donation.populate('reservedBy', 'name phone');
    await donation.populate('pickedUpBy', 'name phone');

    res.json(donation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/user/me
// @desc    Get user's donations
// @access  Private
router.get('/user/me', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort({ createdAt: -1 });
    res.json(Array.isArray(donations) ? donations : []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/user/reserved
// @desc    Get donations reserved by the user
// @access  Private
router.get('/user/reserved', auth, async (req, res) => {
  try {
    const reservedDonations = await Donation.find({ reservedBy: req.user.id })
      .populate('donor', 'name rating profileImage')
      .sort({ reservedAt: -1 });
    
    res.json(Array.isArray(reservedDonations) ? reservedDonations : []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/reserved
// @desc    Get donations reserved by the user (legacy route)
// @access  Private
router.get('/reserved', auth, async (req, res) => {
  try {
    const reservedDonations = await Donation.find({ reservedBy: req.user.id })
      .populate('donor', 'name rating profileImage')
      .sort({ reservedAt: -1 });
    
    res.json(Array.isArray(reservedDonations) ? reservedDonations : []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
