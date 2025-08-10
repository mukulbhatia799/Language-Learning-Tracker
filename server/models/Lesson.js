import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  language: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  completedAt: { type: Date },
  notes: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);