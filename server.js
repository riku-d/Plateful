const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Food model for auto-removal task
const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-ranger', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/food', require('./routes/foodRoutes')); // ✅ Add food route
app.use('/api/requests', require('./routes/requests'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// ❌ remove static serving in dev
// Only keep this for production deployment
// const path = require('path');
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client', 'build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Function to remove expired food items
async function removeExpiredFood() {
  try {
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
  } catch (err) {
    console.error('❌ Error removing expired food:', err);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  
  // Schedule auto-removal of expired food every 5 minutes
  setInterval(removeExpiredFood, 5 * 60 * 1000);
  
  // Run once at startup
  removeExpiredFood();
});
