import mongoose from 'mongoose';

const vocabSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, required: true },
  term: { type: String, required: true, trim: true },
  translation: { type: String, required: true, trim: true },
  partOfSpeech: { type: String, enum: ['noun', 'verb', 'adj', 'adv', 'phrase', 'other'], default: 'other' },
  example: { type: String, trim: true },
  learned: { type: Boolean, default: false }
}, { timestamps: true });

vocabSchema.index({ user: 1, language: 1, term: 1 }, { unique: true });

export default mongoose.model('Vocab', vocabSchema);