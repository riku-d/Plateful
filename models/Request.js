const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
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
  foodTypes: [{
    type: String,
    enum: ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'baked-goods', 'canned-goods', 'frozen', 'other']
  }],
  quantity: {
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['lbs', 'kg', 'pieces', 'packages', 'containers', 'other']
    }
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  neededBy: {
    type: Date,
    required: true
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
    deliveryInstructions: String
  },
  dietaryRestrictions: [String],
  allergens: [String],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'fulfilled', 'cancelled'],
    default: 'open'
  },
  fulfilledBy: [{
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation'
    },
    fulfilledAt: Date,
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  notes: String
}, {
  timestamps: true
});

// Index for geospatial queries
requestSchema.index({ 'location.coordinates': '2dsphere' });

// Index for status and urgency
requestSchema.index({ status: 1, urgency: 1, neededBy: 1 });

// Virtual for days until needed
requestSchema.virtual('daysUntilNeeded').get(function() {
  const now = new Date();
  const diffTime = this.neededBy - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if request is urgent
requestSchema.methods.isUrgent = function() {
  const daysUntilNeeded = this.daysUntilNeeded;
  return this.urgency === 'critical' || (daysUntilNeeded <= 1);
};

// Method to check if request can be fulfilled
requestSchema.methods.canBeFulfilled = function() {
  return this.status === 'open' && new Date() <= this.neededBy;
};

module.exports = mongoose.model('Request', requestSchema);
