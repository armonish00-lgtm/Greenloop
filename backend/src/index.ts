import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import apiRoutes from './routes/api';
import { setupSocketServer } from './sockets/chatSocket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded static assets
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'greenloop-backend', timestamp: new Date() });
});

// Mount API routes
app.use('/api', apiRoutes);

// Socket.IO Server configuration
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

setupSocketServer(io);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[GreenLoop] Production Backend Server Active!`);
  console.log(`[HTTP] Server: http://localhost:${PORT}`);
  console.log(`[Socket.IO] Hub: Attached to port ${PORT}`);
  console.log(`[Uploads] Dir: ${uploadDir}`);
  console.log(`=======================================================`);
});

export default app;
