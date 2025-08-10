import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true }, // 0..n-1
}, { _id: false });

const testSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  language: { type: String, required: true },      // language of the test
  durationSec: { type: Number, required: true },   // timer
  questions: { type: [questionSchema], default: [] },
  isLive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
