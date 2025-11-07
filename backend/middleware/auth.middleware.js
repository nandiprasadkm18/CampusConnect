import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// This middleware just checks if user is logged in
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID in the token and attach them to the request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ message: 'User not found' });
      }
      
      next(); // Move on to the next function (e.g., the route handler)
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// This middleware checks if user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403); // 403 Forbidden
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };