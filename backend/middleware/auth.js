import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Make sure this path is correct
import dotenv from 'dotenv';
dotenv.config();

/**
 * @desc Middleware to protect routes by verifying JWT
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for the token in the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID and attach it to the request object
      // Exclude the password field from the user object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ message: 'User not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc Middleware to check if the user is an admin
 */
export const admin = (req, res, next) => {
  // This middleware MUST run *after* the 'protect' middleware
  // 'protect' adds the 'req.user' object
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    // User is not an admin or req.user doesn't exist
    res.status(403).json({ message: 'Not authorized. Admin access only.' });
  }
};