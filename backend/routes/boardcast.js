import express from 'express';
import Broadcast from '../models/Boardcast.js';
import User from '../models/user.js';
import { protect, admin } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

/**
 * @route   POST /api/broadcasts
 * @desc    Admin send festival notification to all employees
 * @access  Private/Admin
 */
router.post('/', protect, admin, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // 1. Save the broadcast message to the database
    const broadcast = new Broadcast({
      message,
      sentBy: req.user.id,
    });
    await broadcast.save();

    // 2. Find all employees
    const users = await User.find({ role: 'employee' });

    // 3. Send an email to each employee
    const emailPromises = users.map(user => 
      sendEmail(user.email, 'Festival Celebration', message)
    );
    
    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Broadcast notification sent successfully to all employees.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;