const mongoose = require('mongoose');

const organizationApplicationSchema = new mongoose.Schema({
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
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('OrganizationApplication', organizationApplicationSchema);