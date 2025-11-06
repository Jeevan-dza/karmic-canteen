import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { sendEmail } from '../utils/email.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Register (Admin can create users)
// UPDATED: Now includes all new user fields
router.post('/register', async (req, res) => {
  const { email, password, role, name, employeeId, mobile, locationType } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      email, 
      password: hashed, 
      role,
      name,
      employeeId,
      mobile,
      locationType
    });
    await user.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
// UPDATED: Now accepts new fields from frontend and updates user profile
router.post('/login', async (req, res) => {
  // 'workLocation' from frontend maps to 'locationType' in backend
  const { email, password, name, employeeId, mobile, workLocation } = req.body; 
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If employee logs in, update their details from the login form
    if (user.role === 'employee') {
      user.locationType = workLocation || 'Main Office'; // Map 'workLocation'
      user.name = name || user.name;
      user.employeeId = employeeId || user.employeeId;
      user.mobile = mobile || user.mobile;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        email: user.email,
        role: user.role,
        name: user.name, // Send name back
        locationType: user.locationType, // Send updated location
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  await sendEmail(email, 'Password Reset', `Reset your password: ${resetLink}`);
  res.json({ message: 'Reset link sent' });
});

export default router;