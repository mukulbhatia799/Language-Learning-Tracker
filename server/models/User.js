import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const profileSchema = new mongoose.Schema({
  role: { type: String, enum: ['learner', 'tutor'], required: true },
  gender: { type: String, enum: ['male','female','non-binary','prefer-not-to-say'], default: 'prefer-not-to-say' },
  comfortableLanguages: [{ type: String, trim: true }],
  learningLanguage: { type: String, trim: true },
  teachingLanguages: [{ type: String, trim: true }],
  deadline: { type: Date },
  hoursPerDay: { type: Number, default: 0 },
  hoursPerWeek: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?\d{7,15}$/, 'Phone number must be 7–15 digits and may start with +'],
  },
  password: { type: String, required: true, minlength: 6 },
  profile: { type: profileSchema, required: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);