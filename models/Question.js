import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  subject: { type: String, required: true }, // 'Physics', 'Chemistry', 'Mathematics'
  text: { type: String, required: true },
  questionImage: { type: String, default: null }, // base64 or URL (optional)
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  solutionText: { type: String },
  marks: { type: Number, default: 2 },       // MHT-CET: +2 per correct
  negativeMarks: { type: Number, default: 0 } // MHT-CET: 0 negative marking
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
