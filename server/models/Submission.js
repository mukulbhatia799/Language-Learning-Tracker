import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  qIndex: { type: Number, required: true },
  optionIndex: { type: Number, required: true },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true, index: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answers: { type: [answerSchema], default: [] },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  comment: { type: String, default: '' }, // tutor comment
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
