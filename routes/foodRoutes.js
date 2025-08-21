const express = require('express');
const router = express.Router();
const { sendWhatsAppBroadcast } = require('../utils/whatsapp');
const Food = require('../models/Food');

// ✅ Test route to send broadcast
router.post('/test-whatsapp', async (req, res) => {
  try {
    await sendWhatsAppBroadcast(
      "+917908250388",
      "Hello 👋 This is a test broadcast from your Food Donation app!"
    );
    res.json({ success: true, message: 'Test broadcast sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Add food donation
router.post('/donate', async (req, res) => {
  try {
    const { donorName, foodType, quantity, donorNumber, title,
      description,
      location,
      packaging,
      humidity,
      temperature} = req.body;

    // Validate required fields
    if (!donorName || !foodType || !quantity || !donorNumber || !title || 
        !description || !location || !packaging || !humidity || !temperature) {
      return res.status(400).json({ 
        success: false, 
        error: 'All required fields must be provided' 
      });
    }

    const newFood = new Food({ 
      donorName, 
      foodType, 
      quantity, 
      donorNumber, 
      title,
      description,
      location,
      packaging,
      humidity,
      temperature 
    });
    
    await newFood.save();

    // ✅ Broadcast to all donors including current donor
    const message = `🍲 New Food Donation Available!\n\n📌 Title: ${title}\n📝 Description: ${description}\n👤 Donor: ${donorName}\n🥗 Food Type: ${foodType}\n📦 Quantity: ${quantity}\n📍 Location: ${location}\n📦 Packaging: ${packaging}\n🌡️ Temperature: ${temperature}°C\n💧 Humidity: ${humidity}%\n⏳ Expiry: ${newFood.expiryHours}\n\n📱 Contact: ${donorNumber}`;

    await sendWhatsAppBroadcast(donorNumber, message);

    res.json({ 
      success: true, 
      food: newFood,
      message: 'Food donation created and WhatsApp broadcast sent successfully!'
    });
  } catch (err) {
    console.error('❌ Error creating food donation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get all food donations with auto-removal logic
router.get('/all', async (req, res) => {
  try {
    // ✅ Auto-remove expired foods (10 minutes or less remaining)
    const now = new Date();
    const expiredFoods = await Food.find({
      expiryTime: { $lte: new Date(now.getTime() + (10 * 60 * 1000)) }
    });
    
    if (expiredFoods.length > 0) {
      console.log(`🗑️ Auto-removing ${expiredFoods.length} expired food donations`);
      await Food.deleteMany({
        _id: { $in: expiredFoods.map(f => f._id) }
      });
    }
    
    // ✅ Get remaining active foods with expiry information
    const foods = await Food.find().sort({ createdAt: -1 });
    
    // ✅ Add expiry status and remaining time to each food item
    const foodsWithExpiry = foods.map(food => {
      const foodObj = food.toObject();
      return {
        ...foodObj,
        remainingMinutes: food.remainingMinutes,
        expiryStatus: food.expiryStatus,
        shouldBeRemoved: food.shouldBeRemoved()
      };
    });
    
    res.json({ 
      success: true, 
      foods: foodsWithExpiry,
      removedCount: expiredFoods.length
    });
  } catch (err) {
    console.error('❌ Error fetching food donations:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get food donation by ID
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food donation not found' });
    }
    res.json({ success: true, food });
  } catch (err) {
    console.error('❌ Error fetching food donation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Reserve a food donation
router.post('/:id/reserve', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food donation not found' });
    }
    
    // Update the food status to 'reserved'
    food.status = 'reserved';
    await food.save();
    
    res.json({ success: true, message: 'Food donation reserved successfully', food });
  } catch (err) {
    console.error('❌ Error reserving food donation:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Mark a food donation as picked up
router.post('/:id/pickup', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food donation not found' });
    }
    
    // Update the food status to 'picked-up'
    food.status = 'picked-up';
    await food.save();
    
    res.json({ success: true, message: 'Food donation marked as picked up' });
  } catch (err) {
    console.error('❌ Error marking food donation as picked up:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update food donation status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['available', 'reserved', 'picked-up', 'delivered', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food donation not found' });
    }
    
    // Update the food status
    food.status = status;
    await food.save();
    
    res.json({ 
      success: true, 
      message: `Food donation status updated to ${status}`,
      food
    });
  } catch (err) {
    console.error('❌ Error updating food donation status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
