const mongoose = require('mongoose');
const { calculateExpiryHours } = require('../models/expiryModel'); // ✅ import your expiry calculation function

const foodSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  donorNumber: { type: String, required: true }, // ✅ store donor's WhatsApp number
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  packaging: { type: String, required: true },
  humidity: { type: Number, required: true },
  temperature: { type: Number, required: true },
  expiryHours: { type: String },  // ✅ will be auto-calculated
  expiryTime: { type: Date }, // ✅ Store actual expiry timestamp
  createdAt: { type: Date, default: Date.now }
});

// 🔥 Pre-save hook to calculate expiryHours and expiryTime automatically
foodSchema.pre('save', async function (next) {
  try {
    if (!this.expiryHours) {
      const hours = await calculateExpiryHours(this.foodType, this.temperature, this.humidity, this.packaging);
      this.expiryHours = `Consume within ${hours} hours`;
      
      // ✅ Calculate actual expiry timestamp
      const now = new Date();
      this.expiryTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    }
    next();
  } catch (err) {
    console.error('❌ Error in pre-save hook for expiryHours:', err.message);
    next(err);
  }
});

// ✅ Virtual for remaining time in minutes
foodSchema.virtual('remainingMinutes').get(function() {
  if (!this.expiryTime) return null;
  const now = new Date();
  const diffMs = this.expiryTime - now;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60)));
});

// ✅ Virtual for expiry status (green/blue/red)
foodSchema.virtual('expiryStatus').get(function() {
  const remaining = this.remainingMinutes;
  if (remaining === null) return 'unknown';
  
  if (remaining <= 10) return 'expired'; // Red - 10 minutes or less
  if (remaining <= 30) return 'critical'; // Red - 30 minutes or less
  if (remaining <= 60) return 'warning'; // Blue - 1 hour or less
  return 'safe'; // Green - More than 1 hour
});

// ✅ Method to check if food should be auto-removed
foodSchema.methods.shouldBeRemoved = function() {
  return this.remainingMinutes <= 10;
};

module.exports = mongoose.model('Food', foodSchema);
