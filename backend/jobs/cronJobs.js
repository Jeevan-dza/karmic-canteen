import cron from 'node-cron';
import Order from '../models/Order.js';
import User from '../models/user.js';
import { sendEmail } from '../utils/email.js';

// Auto-unclaim after cutoff
cron.schedule('0 * * * *', async () => {
  console.log('Running auto-unclaim job...');
  const now = new Date();
  const hour = now.getHours();
  const orders = await Order.find({ status: 'active' });

  for (const order of orders) {
    let unclaim = false;
    if (order.breakfast && hour >= 10) unclaim = true;
    if (order.lunch && hour >= 14) unclaim = true;
    if (order.snacks && hour >= 18) unclaim = true; // ADDED (6:30 PM cutoff -> 18:00)
    if (order.dinner && hour >= 21) unclaim = true; // UPDATED (9:30 PM cutoff -> 21:00)

    if (unclaim) {
      order.status = 'unclaimed';
      await order.save();
      const user = await User.findById(order.userId);
      if (user) {
        await sendEmail(user.email, 'Order Unclaimed', 'Your order passed mealtime and is now unclaimed.');
      }
    }
  }
});

// --- REMOVED 8 AM and 9 AM reminders ---

// --- NEW: 12:30 PM Food Registration Reminder ---
cron.schedule('30 12 * * *', async () => {
  console.log('Running 12:30 PM food registration reminder...');
  const today = new Date().setHours(0, 0, 0, 0);

  // Find users at the 'Main Office'
  const users = await User.find({ role: 'employee', locationType: 'Main Office' });

  for (const user of users) {
    // Check if they have ANY active order for today
    const hasOrder = await Order.findOne({ 
      userId: user._id, 
      status: 'active', 
      date: { $gte: today },
      // Check if any meal is true
      $or: [
        { breakfast: true },
        { lunch: true },
        { snacks: true },
        { dinner: true }
      ]
    });

    // If they have no order, send the reminder email
    if (!hasOrder) {
      await sendEmail(
        user.email, 
        'Food Registration Reminder', 
        'Are you working from home today? Have you changed your work location? If not, please register for food.'
      );
    }
  }
});

console.log('Cron jobs scheduled');