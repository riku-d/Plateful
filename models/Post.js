const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for searching posts by title and content
PostSchema.index({ title: 'text', content: 'text' });

// Index for sorting by date
PostSchema.index({ date: -1 });

module.exports = mongoose.model('Post', PostSchema);