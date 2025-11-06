import express from 'express';
import Order from '../models/Order.js';
import User from '../models/user.js';
import { protect, admin } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Get orders (admin: all, employee: own)
router.get('/', protect, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('userId', 'email');
    } else {
      orders = await Order.find({ userId: req.user.id });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
// UPDATED: Added 'snacks'
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'employee')
    return res.status(403).json({ message: 'Forbidden' });

  const { breakfast, lunch, snacks, dinner } = req.body; // Added snacks
  if (!breakfast && !lunch && !snacks && !dinner) { // Added snacks
    return res.status(400).json({ message: 'Select at least one meal' });
  }

  try {
    const order = new Order({ 
      userId: req.user.id, 
      breakfast, 
      lunch, 
      snacks, // Added snacks
      dinner 
    });
    await order.save();

    const user = await User.findById(req.user.id);
    const meals = [
      breakfast && 'Breakfast',
      lunch && 'Lunch',
      snacks && 'Snacks', // Added snacks
      dinner && 'Dinner',
    ]
      .filter(Boolean)
      .join(', ');
    await sendEmail(
      user.email,
      'Order Confirmed',
      `Your order for ${meals} is confirmed!`
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order (cancel, pickup, pay)
router.put('/:id', protect, async (req, res) => {
  const { status, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 🔒 SECURITY FIX: Check for admin or order ownership
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    const user = await User.findById(order.userId);
    if (status === 'canceled') {
      await sendEmail(
        user.email,
        'Order Canceled',
        'Your order has been canceled.'
      );
    } else if (status === 'picked_up') {
      await sendEmail(user.email, 'Picked Up', 'Your meal has been picked up.');
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear all (admin)
router.delete('/', protect, admin, async (req, res) => {
  await Order.deleteMany({});
  res.json({ message: 'All orders cleared' });
});

export default router;