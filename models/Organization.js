const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['food-bank', 'shelter', 'community-center', 'church', 'non-profit', 'other'],
    required: true
  },
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [String],
  capacity: {
    dailyMeals: Number,
    storageCapacity: String,
    refrigeration: Boolean,
    freezer: Boolean
  },
  requirements: {
    documentation: [String],
    restrictions: [String],
    eligibility: String
  },
  logo: String,
  images: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'volunteer', 'coordinator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
organizationSchema.index({ 'address.coordinates': '2dsphere' });

// Index for type and status
organizationSchema.index({ type: 1, status: 1 });

// Method to check if organization is open
organizationSchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  
  const hours = this.operatingHours[dayOfWeek];
  if (!hours || !hours.open || !hours.close) return false;
  
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Method to get available services
organizationSchema.methods.getAvailableServices = function() {
  return this.services.filter(service => service && service.trim() !== '');
};

module.exports = mongoose.model('Organization', organizationSchema);
