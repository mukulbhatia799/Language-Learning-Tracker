// server/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true
    }
  });

  // Auth for socket connection using existing JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role, name: decoded.name };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.user.id;
    socket.join(`user:${uid}`); // personal room for notifications

    // Join/leave chat rooms on demand
    socket.on("chat:join", ({ peerId }) => {
      const room = roomKey(uid, peerId);
      socket.join(room);
    });

    socket.on("chat:leave", ({ peerId }) => {
      const room = roomKey(uid, peerId);
      socket.leave(room);
    });

    socket.on("chat:typing", ({ peerId, typing }) => {
      const room = roomKey(uid, peerId);
      socket.to(room).emit("chat:typing", { from: uid, typing: !!typing });
    });
  });

  return io;
}

export function roomKey(a, b) {
  return `chat:${[String(a), String(b)].sort().join(":")}`;
}

export function emitNotification(userId, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit("notification:new", payload);
}

export function emitChatMessage(fromId, toId, message) {
  if (!io) return;
  const room = roomKey(fromId, toId);
  io.to(room).emit("chat:message", message);
  // Also nudge recipient via notification channel (lightweight)
  io.to(`user:${toId}`).emit("notification:new", {
    _id: message._id,
    title: "New message",
    message: message.text,
    from: fromId,
    createdAt: message.createdAt,
  });
}
