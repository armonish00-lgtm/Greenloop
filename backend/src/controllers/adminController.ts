import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { VerificationStatus, ReportStatus, ListingStatus } from '@prisma/client';

export const getAdminOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const activeListings = await prisma.listing.count({ where: { status: ListingStatus.ACTIVE } });
    const pendingReports = await prisma.report.count({ where: { status: ReportStatus.PENDING } });
    const pendingVerifications = await prisma.verification.count({ where: { status: VerificationStatus.PENDING_REVIEW } });
    const completedTransactions = await prisma.transaction.count();

    const recentAuditLogs = await prisma.auditLog.findMany({
      include: {
        admin: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      metrics: {
        totalUsers,
        activeListings,
        pendingReports,
        pendingVerifications,
        completedTransactions,
      },
      recentAuditLogs,
    });
  } catch (error) {
    console.error('Get admin overview error:', error);
    res.status(500).json({ message: 'Server error loading admin metrics.' });
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status as ReportStatus;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        reportedUser: {
          select: { id: true, fullName: true, email: true, isSuspended: true, isBanned: true },
        },
        reportedListing: {
          select: { id: true, title: true, module: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports.' });
  }
};

export const getUserPastOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const requests = await prisma.request.findMany({
      where: {
        OR: [
          { requesterId: req.user.id },
          { ownerId: req.user.id },
        ],
      },
      include: {
        listing: {
          select: { id: true, title: true, module: true, price: true, priceUnit: true },
        },
        requester: {
          select: { id: true, fullName: true, email: true },
        },
        owner: {
          select: { id: true, fullName: true, email: true },
        },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ orders: requests });
  } catch (error) {
    console.error('Get user past orders error:', error);
    res.status(500).json({ message: 'Failed to retrieve past exchanges.' });
  }
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({ where: { verificationStatus: VerificationStatus.VERIFIED } });
    const suspendedUsers = await prisma.user.count({ where: { isSuspended: true } });
    const bannedUsers = await prisma.user.count({ where: { isBanned: true } });

    // Module breakdown
    const moduleCounts = await prisma.listing.groupBy({
      by: ['module'],
      _count: { _all: true },
    });

    // Transactions impact
    const txAggregations = await prisma.transaction.aggregate({
      _count: { id: true },
      _sum: {
        wasteDivertedKg: true,
        co2AvoidedKg: true,
        estimatedMoneySavedInr: true,
      },
    });

    // Report stats
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({ where: { status: ReportStatus.PENDING } });
    const resolvedReports = await prisma.report.count({ where: { status: ReportStatus.RESOLVED } });
    const dismissedReports = await prisma.report.count({ where: { status: ReportStatus.DISMISSED } });
    const noticesSent = await prisma.report.count({ where: { adminResolutionAction: 'NOTICE' } });
    const suspensionsIssued = await prisma.report.count({ where: { adminResolutionAction: 'SUSPEND' } });
    const bansIssued = await prisma.report.count({ where: { adminResolutionAction: 'BAN' } });

    // Neighborhood distribution
    const usersByNeighborhood = await prisma.user.groupBy({
      by: ['neighborhood'],
      _count: { _all: true },
    });

    const listingsByNeighborhood = await prisma.listing.groupBy({
      by: ['neighborhood'],
      _count: { _all: true },
    });

    // Recent transactions
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        completedAt: true,
        wasteDivertedKg: true,
        co2AvoidedKg: true,
        module: true,
      },
      orderBy: { completedAt: 'asc' },
    });

    res.json({
      overview: {
        totalUsers,
        verifiedUsers,
        suspendedUsers,
        bannedUsers,
        totalTransactions: txAggregations._count.id || 0,
        totalWasteDivertedKg: Number(txAggregations._sum.wasteDivertedKg || 0),
        totalCo2AvoidedKg: Number(txAggregations._sum.co2AvoidedKg || 0),
        totalMoneySavedInr: Number(txAggregations._sum.estimatedMoneySavedInr || 0),
      },
      moduleDistribution: moduleCounts.map((m) => ({
        module: m.module,
        count: m._count._all,
      })),
      neighborhoods: usersByNeighborhood.map((n) => {
        const listingMatch = listingsByNeighborhood.find((l) => l.neighborhood === n.neighborhood);
        return {
          neighborhood: n.neighborhood,
          userCount: n._count._all,
          listingCount: listingMatch ? listingMatch._count._all : 0,
        };
      }),
      safety: {
        totalReports,
        pendingReports,
        resolvedReports,
        dismissedReports,
        noticesSent,
        suspensionsIssued,
        bansIssued,
      },
      transactionsHistory: transactions,
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics.' });
  }
};

export const fileReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const {
      reportedUserId,
      reportedListingId,
      transactionId,
      category,
      reason,
      description,
      imageUrl: bodyImageUrl,
    } = req.body;

    const file = req.file;
    const finalImageUrl = file ? `/uploads/${file.filename}` : (bodyImageUrl || null);

    if (!reason && !category) {
      res.status(400).json({ message: 'Category or reason is required.' });
      return;
    }

    if (!description) {
      res.status(400).json({ message: 'Description details are required.' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedUserId: reportedUserId || null,
        reportedListingId: reportedListingId || null,
        transactionId: transactionId || null,
        category: category || reason,
        reason: reason || category || 'Community Guideline Report',
        description,
        imageUrl: finalImageUrl,
        status: ReportStatus.PENDING,
      },
    });

    res.status(201).json({
      message: 'Report submitted directly to the Community Admin Portal. Our safety team will review it promptly.',
      report,
    });
  } catch (error) {
    console.error('File report error:', error);
    res.status(500).json({ message: 'Server error filing report.' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      status,
      adminNotes,
      action, // 'NOTICE' | 'SUSPEND' | 'BAN' | 'RESOLVE' | 'DISMISS'
      noticeMessage,
      suspendDays,
      banReason,
    } = req.body;

    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        reportedUser: true,
        reporter: true,
      },
    });

    if (!existingReport) {
      res.status(404).json({ message: 'Report not found.' });
      return;
    }

    let resolutionAction = action || 'RESOLVE';
    let targetUserId = existingReport.reportedUserId;

    // Execute specific admin moderation actions if selected
    if (action === 'NOTICE' && targetUserId) {
      const msg = noticeMessage || 'Official warning regarding violation of GreenLoop community guidelines.';
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Official Notice from GreenLoop Administration',
          body: msg,
          actionUrl: '/dashboard',
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'NOTICE_ISSUED',
          targetType: 'USER',
          targetId: targetUserId,
          details: { reportId: id, noticeMessage: msg },
          ipAddress: req.ip,
        },
      });
    } else if (action === 'SUSPEND' && targetUserId) {
      const days = suspendDays ? parseInt(suspendDays, 10) : 7;
      const until = new Date();
      until.setDate(until.getDate() + days);

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isSuspended: true,
          suspendedUntil: until,
          banReason: adminNotes || `Temporarily suspended for ${days} days following community safety review.`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: `Account Suspended for ${days} Days`,
          body: `Your GreenLoop privileges are suspended until ${until.toISOString().split('T')[0]}. Reason: ${adminNotes || 'Breach of terms'}`,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'USER_SUSPENDED',
          targetType: 'USER',
          targetId: targetUserId,
          details: { reportId: id, durationDays: days, until, adminNotes },
          ipAddress: req.ip,
        },
      });
    } else if (action === 'BAN' && targetUserId) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isBanned: true,
          banReason: banReason || adminNotes || 'Permanently removed from GreenLoop platform following community safety review.',
        },
      });

      // Pause active listings
      await prisma.listing.updateMany({
        where: { userId: targetUserId, status: ListingStatus.ACTIVE },
        data: { status: ListingStatus.PAUSED },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'USER_BANNED',
          targetType: 'USER',
          targetId: targetUserId,
          details: { reportId: id, banReason: banReason || adminNotes },
          ipAddress: req.ip,
        },
      });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: status ? (status as ReportStatus) : ReportStatus.RESOLVED,
        adminNotes: adminNotes || undefined,
        adminResolutionAction: resolutionAction,
        adminNoticeMessage: noticeMessage || undefined,
        resolvedAt: new Date(),
      },
    });

    res.json({
      message: `Report resolved successfully. Action taken: ${resolutionAction}.`,
      report: updated,
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ message: 'Server error resolving report.' });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { durationDays, reason } = req.body;

    const days = durationDays ? parseInt(durationDays, 10) : 7;
    const until = new Date();
    until.setDate(until.getDate() + days);

    const user = await prisma.user.update({
      where: { id },
      data: {
        isSuspended: true,
        suspendedUntil: until,
        banReason: reason || `Suspended for ${days} days due to guideline breach.`,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'USER_SUSPENDED',
        targetType: 'USER',
        targetId: id,
        details: { durationDays: days, until, reason },
        ipAddress: req.ip,
      },
    });

    res.json({
      message: `User ${user.fullName} suspended until ${until.toISOString().split('T')[0]}.`,
      user,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ message: 'Server error suspending user.' });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        isBanned: true,
        banReason: reason || 'Permanently removed from GreenLoop platform.',
      },
    });

    // Also deactivate their active listings
    await prisma.listing.updateMany({
      where: { userId: id, status: ListingStatus.ACTIVE },
      data: { status: ListingStatus.PAUSED },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'USER_BANNED',
        targetType: 'USER',
        targetId: id,
        details: { reason },
        ipAddress: req.ip,
      },
    });

    res.json({
      message: `User ${user.fullName} permanently banned.`,
      user,
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error banning user.' });
  }
};

export const getVerifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const verifications = await prisma.verification.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            organizationName: true,
            neighborhood: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ verifications });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ message: 'Server error fetching verifications.' });
  }
};

export const updateVerificationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const updatedVerif = await prisma.$transaction(async (tx) => {
      const verif = await tx.verification.update({
        where: { id },
        data: {
          status: status as VerificationStatus,
          reviewerNotes: notes || undefined,
          reviewedById: req.user!.id,
          reviewedAt: new Date(),
        },
      });

      // Update user verification status
      await tx.user.update({
        where: { id: verif.userId },
        data: {
          verificationStatus: status as VerificationStatus,
        },
      });

      // Log admin action
      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: `VERIFICATION_${status}`,
          targetType: 'VERIFICATION',
          targetId: id,
          details: { userId: verif.userId, status, notes },
          ipAddress: req.ip,
        },
      });

      return verif;
    });

    res.json({
      message: `Verification status updated to ${status}.`,
      verification: updatedVerif,
    });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({ message: 'Server error updating verification.' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        admin: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};
