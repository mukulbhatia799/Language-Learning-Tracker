// server/models/Message.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  roomKey: { type: String, index: true, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  text: { type: String, required: true, trim: true },
  readAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Message", schema);
