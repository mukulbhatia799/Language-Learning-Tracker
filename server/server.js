import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import lessonRoutes from './routes/lessons.routes.js';
import vocabRoutes from './routes/vocab.routes.js';
import progressRoutes from './routes/progress.routes.js';
import profileRoutes from './routes/profile.routes.js';
import testsRoutes from './routes/tests.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import studyLogRoutes from './routes/studylog.routes.js';
import notesRoutes from './routes/notes.routes.js';
import doubtsRoutes from './routes/doubts.routes.js';

import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chatRoutes from './routes/chat.routes.js';
import { initSocket } from './socket.js';


const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/doubts', doubtsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/studylog', studyLogRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`)))
  .catch((err) => { console.error('Mongo connection error:', err); process.exit(1); });
