import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'greenloop_jwt_secret_production_ready_key_2026_super_secure';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketServer = (io: Server) => {
  // Middleware to authenticate socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) return;

    // Join personal user room for direct notifications
    socket.join(`user_${userId}`);
    console.log(`Socket client connected: user_${userId}`);

    // Join specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send real-time chat message
    socket.on('send_message', async (data: { conversationId: string; content: string; isQuickReply?: boolean }) => {
      try {
        const { conversationId, content, isQuickReply } = data;
        if (!content || !content.trim()) return;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) return;
        if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) return;

        const otherUserId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id;

        // Persist message in MySQL
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: content.trim(),
            isQuickReply: !!isQuickReply,
          },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() },
        });

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', message);

        // Also emit notification to the other participant
        io.to(`user_${otherUserId}`).emit('notification', {
          title: `New message from ${message.sender.fullName}`,
          body: content.length > 60 ? content.substring(0, 60) + '...' : content,
          conversationId,
        });
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, isTyping, userName }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        userName,
        isTyping,
      });
    });

    // Live request status update broadcast
    socket.on('request_status_update', ({ requestId, targetUserId, newStatus, listingTitle }) => {
      io.to(`user_${targetUserId}`).emit('request_updated', {
        requestId,
        newStatus,
        listingTitle,
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};
