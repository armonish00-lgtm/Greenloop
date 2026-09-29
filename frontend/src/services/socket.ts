import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from './api';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  const token = localStorage.getItem('greenloop_token');
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected to GreenLoop backend');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
