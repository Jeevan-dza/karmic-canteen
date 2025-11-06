import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect, admin } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';
import User from '../models/user.js';

const router = express.Router();

// Submit feedback
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });

  const { foodRating, hygieneRating, comments } = req.body;
  const sentiment = analyzeSentiment(comments);

  try {
    const feedback = new Feedback({
      userId: req.user.id,
      foodRating,
      hygieneRating,
      comments,
      sentiment,
    });
    await feedback.save();

    const user = await User.findById(req.user.id);
    await sendEmail(user.email, 'Feedback Received', 'Thank you for your feedback!');

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedback (admin)
router.get('/', protect, admin, async (req, res) => {
  const feedback = await Feedback.find().populate('userId', 'email');
  res.json(feedback);
});

function analyzeSentiment(text) {
  const positive = ['good', 'great', 'love', 'tasty', 'excellent', 'amazing'];
  const negative = ['bad', 'poor', 'cold', 'hate', 'awful', 'worst'];
  const lower = (text || '').toLowerCase();
  if (negative.some(w => lower.includes(w))) return 'negative';
  if (positive.some(w => lower.includes(w))) return 'positive';
  return 'neutral';
}

export default router;