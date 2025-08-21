const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Food = require('../models/Food');
const User = require('../models/User');
const Order = require('../models/Order'); // for reservation

const router = express.Router();

// -------------------
// GET /api/donations
// Get all food donations with optional filters
// -------------------
router.get('/', async (req, res) => {
  try {
    const { foodType, location, radius, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    let query = {};

    if (foodType) query.foodType = foodType;

    if (location && radius) {
      const [lat, lng] = location.split(',').map(Number);
      query['location.coordinates'] = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: parseInt(radius) * 1609.34
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const foods = await Food.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formattedFoods = foods.map(f => ({
      ...f.toObject(),
      source: 'foods',
      status: 'available',
      donor: { name: f.donorName, rating: 5 },
      remainingMinutes: f.remainingMinutes,
      expiryStatus: f.expiryStatus,
      shouldBeRemoved: f.shouldBeRemoved()
    }));

    res.json(formattedFoods);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------
// GET /api/donations/:id
// Get a food donation by ID
// -------------------
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    res.json({
      ...food.toObject(),
      source: 'foods',
      status: 'available',
      donor: { name: food.donorName, rating: 5 },
      remainingMinutes: food.remainingMinutes,
      expiryStatus: food.expiryStatus,
      shouldBeRemoved: food.shouldBeRemoved()
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Food not found' });
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------
// POST /api/donations
// Create a new food donation
// -------------------
router.post(
  '/',
  [
    auth,
    body('donorName', 'Donor name is required').not().isEmpty(),
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('foodType', 'Food type is required').isIn([
      'fruits', 'vegetables', 'dairy', 'meat',
      'grains', 'baked-goods', 'canned-goods',
      'frozen', 'other'
    ]),
    body('quantity', 'Quantity is required').isNumeric(),
    body('donorNumber', 'Donor phone number is required').not().isEmpty(),
    body('location', 'Location is required').not().isEmpty(),
    body('packaging', 'Packaging is required').not().isEmpty(),
    body('humidity', 'Humidity is required').isNumeric(),
    body('temperature', 'Temperature is required').isNumeric()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const food = new Food(req.body);
      const savedFood = await food.save();

      res.json({
        ...savedFood.toObject(),
        source: 'foods',
        remainingMinutes: savedFood.remainingMinutes,
        expiryStatus: savedFood.expiryStatus,
        shouldBeRemoved: savedFood.shouldBeRemoved()
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// -------------------
// POST /api/donations/:id/reserve
// Reserve a food donation
// -------------------
router.post('/:id/reserve', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: 'Food not found' });

    // Create an order for this reservation
    const newOrder = new Order({
      user: req.user.id,
      food: food._id,
      quantity: 1,
      orderType: 'pickup',
      pickupTime: new Date(), // or you can allow pickupDate in body
      status: 'pending'
    });

    await newOrder.save();

    res.json({ message: 'Food reserved successfully', order: newOrder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------
// GET /api/donations/user/me
// Get all food donations created by logged-in user
// -------------------
router.get('/user/me', auth, async (req, res) => {
  try {
    const foods = await Food.find({ donorName: req.user.name }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
