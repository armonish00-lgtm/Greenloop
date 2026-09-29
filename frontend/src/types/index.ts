export type UserRole = 'INDIVIDUAL' | 'NGO' | 'BUSINESS' | 'COMMUNITY_ADMIN';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export type ListingModule = 'SHARE_BORROW' | 'FOOD_RESCUE' | 'INDUSTRIAL_SURPLUS' | 'GREEN_MARKETPLACE';

export type ListingStatus = 'ACTIVE' | 'PENDING' | 'RESERVED' | 'COMPLETED' | 'PAUSED' | 'DELETED';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH_ON_HANDOVER' | 'UPI_ON_HANDOVER' | 'FREE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  organizationName?: string;
  bio?: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  ratingAvg: number | string;
  ratingCount: number;
  isSuspended?: boolean;
  isBanned?: boolean;
  createdAt: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  isCover: boolean;
  displayOrder: number;
}

export interface Listing {
  id: string;
  userId: string;
  module: ListingModule;
  title: string;
  description: string;
  category: string;
  status: ListingStatus;
  isFree: boolean;
  price: number | string;
  priceUnit?: string;
  depositAmount: number | string;
  quantity: number | string;
  quantityUnit: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  approximateAddress: string;
  exactPickupAddress?: string;
  metadata?: Record<string, any>;
  co2AvoidedKgPerUnit: number | string;
  wasteDivertedKgPerUnit: number | string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  distanceKm?: number;
  images: ListingImage[];
  user?: Partial<User>;
}

export interface RequestItem {
  id: string;
  listingId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  requestedQuantity: number | string;
  startDate?: string;
  endDate?: string;
  preferredPickupTime?: string;
  questionnaireResponses?: Record<string, any>;
  initialMessage?: string;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
  owner?: Partial<User>;
  requester?: Partial<User>;
  conversation?: { id: string };
  transaction?: any;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  isQuickReply: boolean;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface ConversationItem {
  id: string;
  listingId?: string;
  requestId?: string;
  lastMessageAt: string;
  otherUser?: Partial<User>;
  listing?: Partial<Listing>;
  request?: Partial<RequestItem>;
  latestMessage?: MessageItem;
}

export interface PersonalImpact {
  summary: {
    totalItemsCirculated: number;
    totalWasteDivertedKg: number;
    totalCo2AvoidedKg: number;
    totalMoneySavedInr: number;
    itemsShared: number;
    foodRescuedCount: number;
    surplusRecoveredKg: number;
    productsReused: number;
  };
  monthlyBreakdown: {
    month: string;
    wasteKg: number;
    co2Kg: number;
    exchanges: number;
  }[];
  recentTransactions: any[];
  methodology: {
    wasteAvoided: string;
    co2Avoided: string;
    disclaimer: string;
  };
}

export interface CommunityImpact {
  community: {
    totalExchanges: number;
    totalWasteKg: number;
    totalCo2Kg: number;
    totalMoneyInr: number;
    activeListingsCount: number;
    registeredUsersCount: number;
    foodMealsCount: number;
    toolsCirculated: number;
    industrialKg: number;
    marketProducts: number;
  };
  neighborhoodBreakdown: {
    neighborhood: string;
    wasteKg: number;
    exchanges: number;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporter?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    neighborhood?: string;
  };
  reportedUserId?: string;
  reportedUser?: {
    id: string;
    fullName: string;
    email: string;
    isSuspended: boolean;
    isBanned: boolean;
    suspendedUntil?: string;
  };
  reportedListingId?: string;
  reportedListing?: {
    id: string;
    title: string;
    module: ListingModule;
    status: string;
  };
  transactionId?: string;
  category?: string;
  reason: string;
  description: string;
  imageUrl?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  adminResolutionAction?: 'NOTICE' | 'SUSPEND' | 'BAN' | 'RESOLVE' | 'DISMISS';
  adminNoticeMessage?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    verifiedUsers: number;
    suspendedUsers: number;
    bannedUsers: number;
    totalTransactions: number;
    totalWasteDivertedKg: number;
    totalCo2AvoidedKg: number;
    totalMoneySavedInr: number;
  };
  moduleDistribution: {
    module: ListingModule;
    count: number;
  }[];
  neighborhoods: {
    neighborhood: string;
    userCount: number;
    listingCount: number;
  }[];
  safety: {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    dismissedReports: number;
    noticesSent: number;
    suspensionsIssued: number;
    bansIssued: number;
  };
  transactionsHistory: any[];
}
