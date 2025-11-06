import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodRating: { type: Number, min: 1, max: 5, required: true },
  hygieneRating: { type: Number, min: 1, max: 5, required: true },
  comments: String,
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Feedback', FeedbackSchema);