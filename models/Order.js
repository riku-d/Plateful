const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donation: {
    type: Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  orderType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  pickupTime: {
    type: Date,
    required: function() { return this.orderType === 'pickup'; }
  },
  deliveryAddress: {
    street: {
      type: String,
      required: function() { return this.orderType === 'delivery'; }
    },
    city: {
      type: String,
      required: function() { return this.orderType === 'delivery'; }
    },
    state: {
      type: String,
      required: function() { return this.orderType === 'delivery'; }
    },
    zipCode: {
      type: String,
      required: function() { return this.orderType === 'delivery'; }
    },
    coordinates: {
      lat: {
        type: Number,
        required: function() { return this.orderType === 'delivery'; }
      },
      lng: {
        type: Number,
        required: function() { return this.orderType === 'delivery'; }
      }
    }
  },
  deliveryTime: {
    type: Date,
    required: function() { return this.orderType === 'delivery'; }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'ready', 'in-transit', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for geospatial queries on delivery address
OrderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

module.exports = mongoose.model('Order', OrderSchema);