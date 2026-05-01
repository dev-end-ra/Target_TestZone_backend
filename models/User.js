import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google Login users
  googleId: { type: String }, // Stored if the user logs in via Google
  phone: { type: String },
  targetExam: { type: String, enum: ['JEE', 'MHT-CET (PCM)', 'MHT-CET (PCB)'] },
  // Role & Access Control
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  studentId: { type: String, unique: true, sparse: true },
  avatar: { type: String }, // base64 or URL
}, { timestamps: true });

export default mongoose.model('User', userSchema);
