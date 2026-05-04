import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  testId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  subject:           { type: String, required: true },
  chapter:           { type: String, default: 'General' }, // e.g. "Newton's Laws", "Calculus"
  text:              { type: String, required: true },
  questionImage:     { type: String, default: null },
  options:           [{ type: String, required: true }],
  correctOptionIndex:{ type: Number, required: true },
  solutionText:      { type: String },
  marks:             { type: Number, default: 2 },
  negativeMarks:     { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
