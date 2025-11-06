import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  
  // --- UPDATED FIELDS ---
  name: { type: String },
  employeeId: { type: String },
  mobile: { type: String },
  locationType: { 
    type: String, 
    enum: ['Main Office', 'WFH', 'Any other'], // UPDATED
    default: 'Main Office' 
  },
}, { timestamps: true });

// This line prevents OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;