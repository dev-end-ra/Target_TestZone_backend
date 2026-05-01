import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['JEE', 'MHTCET-PCM', 'MHTCET-PCB'], required: true },
  durationSeconds: { type: Number, required: true },
  subjects: [{ type: String }],
  totalQuestions: { type: Number, default: 0 },
  liveAt: { type: Date, default: Date.now },
  liveUntil: { type: Date }, // End of test window; null = always available
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
