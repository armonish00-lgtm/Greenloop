import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: req.user.id },
          { participant2Id: req.user.id },
        ],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            module: true,
            status: true,
            isFree: true,
            price: true,
            priceUnit: true,
            neighborhood: true,
            exactPickupAddress: true,
            images: { take: 1 },
          },
        },
        request: {
          select: {
            id: true,
            status: true,
            requestedQuantity: true,
            startDate: true,
            endDate: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Populate the other participant's details
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participant1Id === req.user!.id ? conv.participant2Id : conv.participant1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            role: true,
            neighborhood: true,
            verificationStatus: true,
            ratingAvg: true,
          },
        });

        // Check if exact address can be revealed (if user is owner, or request is accepted/completed)
        const canSeeAddress =
          conv.listing?.exactPickupAddress &&
          conv.request &&
          ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(conv.request.status);

        return {
          id: conv.id,
          listingId: conv.listingId,
          requestId: conv.requestId,
          lastMessageAt: conv.lastMessageAt,
          otherUser,
          listing: conv.listing
            ? {
                ...conv.listing,
                exactPickupAddress: canSeeAddress ? conv.listing.exactPickupAddress : undefined,
              }
            : null,
          request: conv.request,
          latestMessage: conv.messages[0] || null,
        };
      })
    );

    res.json({ conversations: formatted });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error retrieving conversations.' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          include: { images: { take: 1 } },
        },
        request: true,
      },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    if (conversation.participant1Id !== req.user.id && conversation.participant2Id !== req.user.id) {
      res.status(403).json({ message: 'Access denied to this conversation.' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: req.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    const otherUserId = conversation.participant1Id === req.user.id ? conversation.participant2Id : conversation.participant1Id;
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        fullName: true,
        organizationName: true,
        avatarUrl: true,
        role: true,
        neighborhood: true,
        verificationStatus: true,
        ratingAvg: true,
      },
    });

    res.json({
      conversation: {
        ...conversation,
        otherUser,
      },
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error retrieving messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;
    const { content, isQuickReply } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ message: 'Message content cannot be empty.' });
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      res.status(404).json({ message: 'Conversation not found.' });
      return;
    }

    if (conversation.participant1Id !== req.user.id && conversation.participant2Id !== req.user.id) {
      res.status(403).json({ message: 'Access denied to this conversation.' });
      return;
    }

    const otherUserId = conversation.participant1Id === req.user.id ? conversation.participant2Id : conversation.participant1Id;

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: req.user.id,
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
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        title: `Message from ${req.user.fullName}`,
        body: content.length > 80 ? content.substring(0, 80) + '...' : content,
        actionUrl: `/messages?conv=${id}`,
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};

export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { listingId, participantId } = req.body;
    let targetUserId = participantId;

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { userId: true },
      });
      if (listing) {
        targetUserId = listing.userId;
      }
    }

    if (!targetUserId) {
      res.status(400).json({ message: 'Recipient user ID or listing ID required.' });
      return;
    }

    if (targetUserId === req.user.id) {
      res.status(400).json({ message: 'Cannot start a conversation with yourself.' });
      return;
    }

    // Check for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              { participant1Id: req.user.id, participant2Id: targetUserId },
              { participant1Id: targetUserId, participant2Id: req.user.id },
            ],
          },
          ...(listingId ? [{ listingId }] : []),
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: req.user.id,
          participant2Id: targetUserId,
          listingId: listingId || null,
        },
      });
    }

    res.status(200).json({ conversationId: conversation.id });
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    res.status(500).json({ message: 'Server error creating or retrieving conversation.' });
  }
};
