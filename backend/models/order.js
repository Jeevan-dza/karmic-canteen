// order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  breakfast: { type: Boolean, default: false },
  lunch: { type: Boolean, default: false },
  snacks: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  status: {
    type: String,
    enum: ['active', 'canceled', 'unclaimed', 'picked_up'],
    default: 'active',
  },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
