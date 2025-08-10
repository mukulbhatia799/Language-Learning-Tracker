import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  meta: { type: Object, default: {} },
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Notification', schema);
