// server/routes/chat.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { emitChatMessage, roomKey } from "../socket.js";

const router = express.Router();

// List peers (tutors for learner, learners for tutor)
router.get("/peers", auth, async (req, res, next) => {
  try {
    const role = req.user.role; // 'learner' or 'tutor'
    const filter = role === 'learner'
      ? { 'profile.role': 'tutor' }
      : { 'profile.role': 'learner' };
    const peers = await User.find(filter).select("name email profile.role").limit(200);
    res.json(peers);
  } catch (e) { next(e); }
});

// Load last N messages with a peer
router.get("/history/:peerId", auth, async (req, res, next) => {
  try {
    const peerId = req.params.peerId;
    const rk = roomKey(req.user.id, peerId);
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const docs = await Message.find({ roomKey: rk })
      .sort({ createdAt: -1 }).limit(limit)
      .lean();
    res.json(docs.reverse());
  } catch (e) { next(e); }
});

// Send a message
router.post("/send", auth, async (req, res, next) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !String(text || "").trim()) {
      return res.status(400).json({ message: "Recipient and text are required" });
    }
    const rk = roomKey(req.user.id, to);
    const msg = await Message.create({ roomKey: rk, from: req.user.id, to, text: String(text).trim() });
    const lean = msg.toObject();
    emitChatMessage(req.user.id, to, {
      _id: lean._id, from: lean.from, to: lean.to, text: lean.text, createdAt: lean.createdAt
    });
    res.status(201).json(lean);
  } catch (e) { next(e); }
});

export default router;
