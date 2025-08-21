const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all requests with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      foodTypes,
      urgency,
      location,
      radius,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: 'open', isPublic: true };

    // Filter by food types
    if (foodTypes) {
      query.foodTypes = { $in: foodTypes.split(',') };
    }

    // Filter by urgency
    if (urgency) {
      query.urgency = urgency;
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
          $maxDistance: parseInt(radius) * 1609.34 // Convert miles to meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await Request.find(query)
      .populate('requester', 'name rating')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name rating profileImage')
      .populate('fulfilledBy.fulfilledBy', 'name phone')
      .populate('organization', 'name type');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/requests
// @desc    Create a new request
// @access  Private
router.post('/', [
  auth,
  body('title', 'Title is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('foodTypes', 'Food types are required').isArray({ min: 1 }),
  body('quantity.amount', 'Quantity amount is required').isNumeric(),
  body('quantity.unit', 'Quantity unit is required').isIn(['lbs', 'kg', 'pieces', 'packages', 'containers', 'other']),
  body('urgency', 'Urgency level is required').isIn(['low', 'medium', 'high', 'critical']),
  body('neededBy', 'Needed by date is required').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      foodTypes,
      quantity,
      urgency,
      neededBy,
      location,
      dietaryRestrictions,
      allergens,
      tags,
      isPublic,
      organization,
      notes
    } = req.body;

    const newRequest = new Request({
      requester: req.user.id,
      title,
      description,
      foodTypes,
      quantity,
      urgency,
      neededBy,
      location,
      dietaryRestrictions: dietaryRestrictions || [],
      allergens: allergens || [],
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      organization,
      notes
    });

    const request = await newRequest.save();
    await request.populate('requester', 'name rating');

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update request
// @access  Private (requester only)
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Only allow updates if request is open
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update request that is not open' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('requester', 'name rating');

    res.json(updatedRequest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private (requester only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await request.remove();
    res.json({ message: 'Request removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/requests/:id/fulfill
// @desc    Fulfill a request with a donation
// @access  Private
router.post('/:id/fulfill', [
  auth,
  body('donationId', 'Donation ID is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { donationId } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Request is not open' });
    }

    // Add fulfillment
    request.fulfilledBy.push({
      donation: donationId,
      fulfilledAt: new Date(),
      fulfilledBy: req.user.id
    });

    // Update status if all food types are fulfilled
    const fulfilledFoodTypes = request.fulfilledBy.map(f => f.donation);
    if (fulfilledFoodTypes.length >= request.foodTypes.length) {
      request.status = 'fulfilled';
    } else {
      request.status = 'in-progress';
    }

    await request.save();
    await request.populate('requester', 'name rating');
    await request.populate('fulfilledBy.fulfilledBy', 'name phone');

    res.json(request);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/user/me
// @desc    Get user's requests
// @access  Private
router.get('/user/me', auth, async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user.id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
