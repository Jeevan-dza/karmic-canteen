// Boardcast.js
import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
