import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { VerificationStatus } from '@prisma/client';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { transactionId, rating, comment } = req.body;

    if (!transactionId || !rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Valid transaction ID and rating between 1 and 5 are required.' });
      return;
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found.' });
      return;
    }

    if (transaction.providerId !== req.user.id && transaction.recipientId !== req.user.id) {
      res.status(403).json({ message: 'You are not a participant in this transaction.' });
      return;
    }

    const revieweeId = transaction.providerId === req.user.id ? transaction.recipientId : transaction.providerId;

    const existingReview = await prisma.review.findFirst({
      where: { transactionId, reviewerId: req.user.id },
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this transaction.' });
      return;
    }

    const review = await prisma.$transaction(async (tx) => {
      const rev = await tx.review.create({
        data: {
          transactionId,
          reviewerId: req.user!.id,
          revieweeId,
          rating: parseInt(rating, 10),
          comment: comment || null,
        },
      });

      // Recalculate average rating for reviewee
      const allReviews = await tx.review.findMany({
        where: { revieweeId },
        select: { rating: true },
      });

      const count = allReviews.length;
      const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? sum / count : 5.0;

      await tx.user.update({
        where: { id: revieweeId },
        data: {
          ratingAvg: Math.round(avg * 100) / 100,
          ratingCount: count,
        },
      });

      return rev;
    });

    res.status(201).json({
      message: 'Review submitted successfully. Thank you for building community trust!',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error creating review.' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error retrieving notifications.' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
      });
      res.json({ message: 'All notifications marked as read.' });
      return;
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error updating notification.' });
  }
};

export const submitVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { documentType, documentUrl } = req.body;
    if (!documentType || !documentUrl) {
      res.status(400).json({ message: 'Document type and document URL are required.' });
      return;
    }

    const verification = await prisma.verification.create({
      data: {
        userId: req.user.id,
        documentType,
        documentUrl,
        status: VerificationStatus.PENDING_REVIEW,
      },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { verificationStatus: VerificationStatus.PENDING_REVIEW },
    });

    res.status(201).json({
      message: 'Verification document submitted for review by community admin.',
      verification,
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ message: 'Server error submitting verification.' });
  }
};
