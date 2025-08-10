import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tutor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional (for Ask AI it's null)
  test:    { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  question:{ type: String, required: true, trim: true },
  answerAI:{ type: String, default: '' },
  answerTutor: { type: String, default: '' },
  status:  { type: String, enum: ['open','answered','closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Doubt', doubtSchema);
