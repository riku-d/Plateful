const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  type: {
    type: String,
    enum: ['post', 'donation', 'comment', 'like', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedTo: {
    // Can be a post ID, donation ID, etc.
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.model'
    },
    model: {
      type: String,
      enum: ['post', 'donation', 'user', 'organization']
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
NotificationSchema.index({ user: 1, date: -1 });
NotificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('notification', NotificationSchema);