import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0, max: 24 },
}, { timestamps: true });
schema.index({ user: 1, date: 1 }, { unique: true });
export default mongoose.model('StudyLog', schema);
