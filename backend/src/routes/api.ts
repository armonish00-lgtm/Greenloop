import { Router } from 'express';
import { authenticate, optionalAuth, authorizeRoles } from '../middleware/auth';
import { upload } from '../lib/upload';
import {
  register,
  login,
  quickLogin,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController';
import {
  getListings,
  getListingById,
  createListing,
  updateListingStatus,
  deleteListing,
} from '../controllers/listingsController';
import {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  updateRequestStatus,
} from '../controllers/requestsController';
import {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation,
} from '../controllers/chatController';
import {
  getPersonalImpact,
  getCommunityImpact,
} from '../controllers/impactController';
import {
  getAdminOverview,
  getAdminAnalytics,
  getReports,
  fileReport,
  resolveReport,
  suspendUser,
  banUser,
  getVerifications,
  updateVerificationStatus,
  getAuditLogs,
  getUserPastOrders,
} from '../controllers/adminController';
import {
  createReview,
  getNotifications,
  markNotificationRead,
  submitVerification,
} from '../controllers/miscController';
import { UserRole } from '@prisma/client';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/quick-login', quickLogin);
router.get('/auth/me', authenticate, getCurrentUser);
router.put('/auth/profile', authenticate, updateProfile);

// --- Listings Routes ---
router.get('/listings', optionalAuth, getListings);
router.get('/listings/:id', optionalAuth, getListingById);
router.post('/listings', authenticate, upload.array('images', 5), createListing);
router.patch('/listings/:id/status', authenticate, updateListingStatus);
router.delete('/listings/:id', authenticate, deleteListing);

// --- Requests & Transactions Routes ---
router.post('/requests', authenticate, createRequest);
router.get('/requests/my-requests', authenticate, getMyRequests);
router.get('/requests/received', authenticate, getReceivedRequests);
router.patch('/requests/:id/status', authenticate, updateRequestStatus);

// --- Chat & Messaging Routes ---
router.get('/chat/conversations', authenticate, getConversations);
router.get('/chat/conversations/:id/messages', authenticate, getMessages);
router.post('/chat/conversations/:id/messages', authenticate, sendMessage);
router.post('/chat/get-or-create', authenticate, getOrCreateConversation);

// --- Impact & Sustainability Analytics ---
router.get('/impact/personal', authenticate, getPersonalImpact);
router.get('/impact/community', optionalAuth, getCommunityImpact);

// --- Community Safety & Moderation (User actions) ---
router.post('/reports', authenticate, upload.single('image'), fileReport);
router.get('/reports/user-orders', authenticate, getUserPastOrders);
router.post('/reviews', authenticate, createReview);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);
router.post('/verifications/submit', authenticate, submitVerification);

// --- Community Admin Moderation Center (Admin only) ---
router.get('/admin/overview', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), getAdminOverview);
router.get('/admin/analytics', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), getAdminAnalytics);
router.get('/admin/reports', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), getReports);
router.patch('/admin/reports/:id', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), resolveReport);
router.post('/admin/users/:id/suspend', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), suspendUser);
router.post('/admin/users/:id/ban', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), banUser);
router.get('/admin/verifications', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), getVerifications);
router.patch('/admin/verifications/:id', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), updateVerificationStatus);
router.get('/admin/audit-logs', authenticate, authorizeRoles(UserRole.COMMUNITY_ADMIN), getAuditLogs);

export default router;
