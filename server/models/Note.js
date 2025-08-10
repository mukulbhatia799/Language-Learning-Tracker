import mongoose from 'mongoose';
const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  source: { type: String, required: true, trim: true },   // e.g., English
  target: { type: String, required: true, trim: true },   // e.g., Hindi
  from:   { type: String, required: true, trim: true },   // word/phrase in source
  to:     { type: String, required: true, trim: true },   // translation in target
  example:{ type: String, trim: true, default: '' }
}, { timestamps: true });
noteSchema.index({ user: 1, source: 1, target: 1, from: 1 }, { unique: true });
export default mongoose.model('Note', noteSchema);
