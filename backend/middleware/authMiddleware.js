const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    // 1. Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Fetch full user object from DB (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User no longer exists' });
    }

    // 3. Attach full user object to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = { verifyToken };