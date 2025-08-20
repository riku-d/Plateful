const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  foodType: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'dairy', 'meat', 'bakery', 
    'canned', 'grains', 'beverages', 'snacks', 'prepared-meals', 'other']
  },
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'grams', 'pieces', 'packets', 'bottles', 'cans', 'loaves', 'dozen']
    }
  },
  expirationDate: {
    type: Date,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  pickupTime: {
    start: String,
    end: String
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    pickupInstructions: String
  },
  images: [String],
  dietaryRestrictions: [String],
  allergens: [String],
  isRefrigerated: {
    type: Boolean,
    default: false
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'picked-up', 'expired', 'cancelled'],
    default: 'available'
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservedAt: Date,
  pickedUpBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickedUpAt: Date,
  tags: [String],
  estimatedValue: {
    type: Number,
    min: 0
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
donationSchema.index({ 'location.coordinates': '2dsphere' });

// Index for status and expiration date
donationSchema.index({ status: 1, expirationDate: 1 });

// Virtual for days until expiration
donationSchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const diffTime = this.expirationDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if donation is expired
donationSchema.methods.isExpired = function() {
  return new Date() > this.expirationDate;
};

// Method to check if donation is available for pickup
donationSchema.methods.isAvailableForPickup = function() {
  return this.status === 'available' && !this.isExpired();
};

module.exports = mongoose.model('Donation', donationSchema);
