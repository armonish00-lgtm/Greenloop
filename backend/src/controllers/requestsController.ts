import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { RequestStatus, ListingStatus, PaymentMethod } from '@prisma/client';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const {
      listingId,
      requestedQuantity,
      startDate,
      endDate,
      preferredPickupTime,
      questionnaireResponses,
      initialMessage,
    } = req.body;

    if (!listingId) {
      res.status(400).json({ message: 'Listing ID is required.' });
      return;
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: true },
    });

    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      res.status(400).json({ message: 'This listing is no longer available for requests.' });
      return;
    }

    if (listing.userId === req.user.id) {
      res.status(400).json({ message: 'You cannot request your own listing.' });
      return;
    }

    // Check for existing pending request
    const existing = await prisma.request.findFirst({
      where: {
        listingId,
        requesterId: req.user.id,
        status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS] },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'You already have an active request for this item.' });
      return;
    }

    // Execute atomic request & conversation creation
    const result = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.request.create({
        data: {
          listingId: listing.id,
          requesterId: req.user!.id,
          ownerId: listing.userId,
          status: RequestStatus.PENDING,
          requestedQuantity: requestedQuantity ? parseFloat(requestedQuantity) : 1,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          preferredPickupTime: preferredPickupTime ? new Date(preferredPickupTime) : null,
          questionnaireResponses: questionnaireResponses || {},
          initialMessage: initialMessage || 'Hello, I am interested in this listing!',
        },
      });

      // Find or create conversation
      let conversation = await tx.conversation.findFirst({
        where: {
          listingId: listing.id,
          OR: [
            { participant1Id: req.user!.id, participant2Id: listing.userId },
            { participant1Id: listing.userId, participant2Id: req.user!.id },
          ],
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            listingId: listing.id,
            requestId: newRequest.id,
            participant1Id: req.user!.id,
            participant2Id: listing.userId,
            lastMessageAt: new Date(),
          },
        });
      }

      // Add initial message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.id,
          content: initialMessage || `Hello, I submitted a request for "${listing.title}".`,
        },
      });

      // Send in-app notification to the listing owner
      await tx.notification.create({
        data: {
          userId: listing.userId,
          title: `New Request: ${listing.title}`,
          body: `${req.user!.fullName} has sent a request for your listing.`,
          actionUrl: `/messages?conv=${conversation.id}`,
        },
      });

      return { newRequest, conversation };
    });

    res.status(201).json({
      message: 'Request submitted successfully! Conversation opened with the owner.',
      request: result.newRequest,
      conversationId: result.conversation.id,
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error submitting request.' });
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const requests = await prisma.request.findMany({
      where: { requesterId: req.user.id },
      include: {
        listing: {
          include: {
            images: { take: 1 },
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            phoneNumber: true,
            neighborhood: true,
            ratingAvg: true,
          },
        },
        conversation: {
          select: { id: true },
        },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error retrieving requests.' });
  }
};

export const getReceivedRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const requests = await prisma.request.findMany({
      where: { ownerId: req.user.id },
      include: {
        listing: {
          include: {
            images: { take: 1 },
          },
        },
        requester: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            phoneNumber: true,
            neighborhood: true,
            verificationStatus: true,
            ratingAvg: true,
          },
        },
        conversation: {
          select: { id: true },
        },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error fetching received requests.' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;
    const { status, paymentMethod } = req.body;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        listing: true,
        requester: true,
        owner: true,
        conversation: true,
      },
    });

    if (!request) {
      res.status(404).json({ message: 'Request not found.' });
      return;
    }

    const isOwner = req.user.id === request.ownerId;
    const isRequester = req.user.id === request.requesterId;
    const isAdmin = req.user.role === 'COMMUNITY_ADMIN';

    if (!isOwner && !isRequester && !isAdmin) {
      res.status(403).json({ message: 'You are not authorized to update this request.' });
      return;
    }

    const newStatus = status as RequestStatus;

    // Validate state transitions
    if (newStatus === RequestStatus.CANCELLED && !isRequester && !isAdmin) {
      res.status(403).json({ message: 'Only the requester can cancel this request.' });
      return;
    }

    if ((newStatus === RequestStatus.ACCEPTED || newStatus === RequestStatus.REJECTED) && !isOwner && !isAdmin) {
      res.status(403).json({ message: 'Only the item owner can accept or reject this request.' });
      return;
    }

    // Atomic transaction handling
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.request.update({
        where: { id },
        data: { status: newStatus },
      });

      // If transitioning to COMPLETED: record transaction and real impact
      if (newStatus === RequestStatus.COMPLETED) {
        const qty = Number(request.requestedQuantity) || 1;
        const wasteKg = (Number(request.listing.wasteDivertedKgPerUnit) || 1.0) * qty;
        const co2Kg = (Number(request.listing.co2AvoidedKgPerUnit) || 1.5) * qty;
        
        let moneySaved = 0;
        if (request.listing.isFree) {
          moneySaved = qty * 450; // Average replacement cost saved
        } else {
          moneySaved = qty * 150; // Reuse savings factor
        }

        // Create transaction record
        await tx.transaction.create({
          data: {
            requestId: request.id,
            listingId: request.listingId,
            providerId: request.ownerId,
            recipientId: request.requesterId,
            module: request.listing.module,
            quantityTransacted: qty,
            wasteDivertedKg: wasteKg,
            co2AvoidedKg: co2Kg,
            estimatedMoneySavedInr: moneySaved,
            paymentMethod: paymentMethod || (request.listing.isFree ? PaymentMethod.FREE : PaymentMethod.UPI_ON_HANDOVER),
          },
        });

        // Update listing status if fully fulfilled
        await tx.listing.update({
          where: { id: request.listingId },
          data: { status: ListingStatus.COMPLETED },
        });

        // Notifications to both parties
        await tx.notification.createMany({
          data: [
            {
              userId: request.requesterId,
              title: `Exchange Completed: ${request.listing.title}`,
              body: `Great job! You saved an estimated ${wasteKg.toFixed(1)} kg of waste and ${co2Kg.toFixed(1)} kg of CO2.`,
              actionUrl: `/impact`,
            },
            {
              userId: request.ownerId,
              title: `Exchange Completed: ${request.listing.title}`,
              body: `Listing marked completed. Thank you for giving resources a second life!`,
              actionUrl: `/impact`,
            },
          ],
        });
      } else if (newStatus === RequestStatus.ACCEPTED) {
        // Notify requester that request was accepted
        await tx.notification.create({
          data: {
            userId: request.requesterId,
            title: `Request Accepted: ${request.listing.title}`,
            body: `${request.owner.fullName} accepted your request! Exact pickup address is now visible.`,
            actionUrl: `/messages?conv=${request.conversation?.id}`,
          },
        });

        // Mark listing as reserved
        await tx.listing.update({
          where: { id: request.listingId },
          data: { status: ListingStatus.RESERVED },
        });
      }

      return updatedReq;
    });

    res.json({
      message: `Request status transitioned to ${newStatus}.`,
      request: updated,
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error updating request status.' });
  }
};
