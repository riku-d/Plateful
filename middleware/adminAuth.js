const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Check if user has admin role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
};