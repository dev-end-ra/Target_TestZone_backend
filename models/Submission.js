import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionIndex: { type: Number, default: null }, // null if not answered
    timeSpentSeconds: { type: Number, default: 0 }
  }],
  totalScore: { type: Number, default: 0 },
  subjectScores: {
    type: Map,
    of: Number,
    default: {}
  },
  timeTakenSeconds: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
