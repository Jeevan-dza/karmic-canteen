// user.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    name: { type: String },
    employeeId: { type: String },
    mobile: { type: String },
    locationType: {
      type: String,
      enum: ['Main Office', 'WFH', 'Any other'],
      default: 'Main Office',
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
