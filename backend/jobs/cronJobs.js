// cronJobs.js
import cron from "node-cron";
import order from "../models/order.js";
import User from "../models/user.js";
import { sendEmail } from '../utils/email.js';


// Auto-unclaim orders after meal cutoff times
cron.schedule("0 * * * *", async () => {
  try {
    console.log("Running auto-unclaim job...");
    const now = new Date();
    const hour = now.getHours();
    const orders = await Order.find({ status: "active" });

    for (const order of orders) {
      let unclaim = false;
      if (order.breakfast && hour >= 10) unclaim = true;
      if (order.lunch && hour >= 14) unclaim = true;
      if (order.snacks && hour >= 18) unclaim = true;
      if (order.dinner && hour >= 21) unclaim = true;

      if (unclaim) {
        order.status = "unclaimed";
        await order.save();
        const user = await User.findById(order.userId);
        if (user) {
          await sendEmail(
            user.email,
            "Order Unclaimed",
            "Your order passed mealtime and is now unclaimed."
          );
        }
      }
    }
  } catch (err) {
    console.error("Auto-unclaim job error:", err);
  }
});

// 12:30 PM Food Registration Reminder
cron.schedule("30 12 * * *", async () => {
  try {
    console.log("Running 12:30 PM food registration reminder...");
    const today = new Date().setHours(0, 0, 0, 0);

    const users = await User.find({
      role: "employee",
      locationType: "Main Office",
    });

    for (const user of users) {
      const hasOrder = await Order.findOne({
        userId: user._id,
        status: "active",
        date: { $gte: today },
        $or: [
          { breakfast: true },
          { lunch: true },
          { snacks: true },
          { dinner: true },
        ],
      });

      if (!hasOrder) {
        await sendEmail(
          user.email,
          "Food Registration Reminder",
          "Are you working from home today? Have you changed your work location? If not, please register for food."
        );
      }
    }
  } catch (err) {
    console.error("Food reminder job error:", err);
  }
});

console.log("✅ Cron jobs scheduled");
