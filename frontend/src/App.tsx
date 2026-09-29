import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { ShareBorrowPage } from './pages/ShareBorrowPage';
import { FoodRescuePage } from './pages/FoodRescuePage';
import { IndustrialSurplusPage } from './pages/IndustrialSurplusPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ChatPage } from './pages/ChatPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { ImpactPage } from './pages/ImpactPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AIChatbot } from './components/common/AIChatbot';

// Modals
import { AuthModal } from './components/modals/AuthModal';
import { CreateListingModal } from './components/modals/CreateListingModal';
import { RequestModal } from './components/modals/RequestModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { ReportIssueModal } from './components/modals/ReportIssueModal';
import { ListingDetailModal } from './components/modals/ListingDetailModal';

import { Listing, ListingModule } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const { user, logout, openAuthModal, postLoginRedirect, setPostLoginRedirect } = useAuth();

  // Navigation state & history stack for seamless Back button
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageHistory, setPageHistory] = useState<string[]>(['landing']);

  // Handle post-login redirection (Always default regular users to Dashboard!)
  useEffect(() => {
    if (user && user.role !== 'COMMUNITY_ADMIN') {
      if (postLoginRedirect) {
        handleNavigate(postLoginRedirect);
        setPostLoginRedirect(null);
      } else if (currentPage === 'landing') {
        handleNavigate('dashboard');
      }
    }
  }, [user, postLoginRedirect]);

  // Whenever an account is logged out, immediately return to the landing page
  const prevUserRef = useRef<typeof user>(user);
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setCurrentPage('landing');
      setPageHistory(['landing']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevUserRef.current = user;
  }, [user]);

  const handleNavigate = (page: string) => {
    if (page !== currentPage) {
      setPageHistory((prev) => [...prev, page]);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // remove current
      const prevPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(prevPage || 'landing');
    } else {
      setCurrentPage('landing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modal States
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [createListingDefaultModule, setCreateListingDefaultModule] = useState<ListingModule>('SHARE_BORROW');

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [requestListing, setRequestListing] = useState<Listing | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [activeChatConvId, setActiveChatConvId] = useState<string | undefined>(undefined);

  // Review modal
  const [reviewTxId, setReviewTxId] = useState<string | null>(null);
  const [reviewPartner, setReviewPartner] = useState<string>('Partner');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Report Issue Modal
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [reportIssueParams, setReportIssueParams] = useState<{
    listingId?: string;
    userId?: string;
    title?: string;
  }>({});

  const handleOpenReportIssue = (params?: { listingId?: string; userId?: string; title?: string }) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setReportIssueParams(params || {});
    setIsReportIssueOpen(true);
  };

  // Handlers
  const handleOpenCreateListing = (mod?: string) => {
    if (mod) {
      setCreateListingDefaultModule(mod.toUpperCase().replace('-', '_') as ListingModule);
    }
    setIsCreateListingOpen(true);
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing);
    setIsDetailModalOpen(true);
  };

  const handleSearchSelect = async (listingId: string) => {
    try {
      const data = await api.getListingById(listingId);
      if (data.listing) {
        setSelectedListing(data.listing);
        setIsDetailModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInitiateRequest = (listing: Listing) => {
    setIsDetailModalOpen(false);
    setRequestListing(listing);
    setIsRequestModalOpen(true);
  };

  const handleInitiateChat = async (listing: Listing) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setIsDetailModalOpen(false);
    try {
      const res = await api.getOrCreateConversation({
        listingId: listing.id,
        participantId: listing.userId,
      });
      setActiveChatConvId(res.conversationId);
      handleNavigate('messages');
    } catch (e: any) {
      handleNavigate('messages');
    }
  };

  const handleOpenReview = (txId: string, partner: string) => {
    setReviewTxId(txId);
    setReviewPartner(partner);
    setIsReviewModalOpen(true);
  };

  const isPortalView = currentPage !== 'landing' && currentPage !== 'admin';

  // 1. DEDICATED ADMIN MODULE ENFORCEMENT:
  // If the user has COMMUNITY_ADMIN role, they MUST ONLY see the Executive Admin Portal.
  // They NEVER see the member selling/borrowing dashboard, sidebar, or marketplace tools.
  if (user?.role === 'COMMUNITY_ADMIN') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <AdminPage
          onExitAdmin={() => {
            logout();
            setCurrentPage('landing');
          }}
        />
      </div>
    );
  }

  // 2. Dedicated Admin Gateway for unauthenticated or non-admin access:
  if (currentPage === 'admin') {
    return (
      <AdminLoginPage
        onSuccess={() => {
          setCurrentPage('admin');
        }}
        onExit={() => setCurrentPage('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-gray-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onOpenCreateListing={handleOpenCreateListing}
        onNavigate={handleNavigate}
        onGoBack={handleGoBack}
        onOpenReportIssue={() => handleOpenReportIssue()}
        onSearchSelect={handleSearchSelect}
      />

      {/* Main Body Layout */}
      {isPortalView ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Desktop Left Sidebar (Clean user portal menu, Admin separated) */}
          <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

          {/* Page View Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage
                onNavigate={handleNavigate}
                onOpenCreateListing={handleOpenCreateListing}
                onSelectListing={handleSelectListing}
              />
            )}
            {currentPage === 'explore' && (
              <ExplorePage
                onSelectListing={handleSelectListing}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'share-borrow' && (
              <ShareBorrowPage
                onSelectListing={handleSelectListing}
                onOpenCreateListing={() => handleOpenCreateListing('SHARE_BORROW')}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'food-rescue' && (
              <FoodRescuePage
                onSelectListing={handleSelectListing}
                onOpenCreateListing={() => handleOpenCreateListing('FOOD_RESCUE')}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'industrial-surplus' && (
              <IndustrialSurplusPage
                onSelectListing={handleSelectListing}
                onOpenCreateListing={() => handleOpenCreateListing('INDUSTRIAL_SURPLUS')}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'marketplace' && (
              <MarketplacePage
                onSelectListing={handleSelectListing}
                onOpenCreateListing={() => handleOpenCreateListing('GREEN_MARKETPLACE')}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'messages' && (
              <ChatPage
                initialConversationId={activeChatConvId}
                onOpenReviewModal={handleOpenReview}
                onNavigate={handleNavigate}
              />
            )}
            {currentPage === 'my-listings' && (
              <MyListingsPage
                onOpenCreateListing={handleOpenCreateListing}
                onSelectListing={handleSelectListing}
              />
            )}
            {currentPage === 'my-requests' && (
              <MyRequestsPage
                onOpenChat={(convId) => {
                  setActiveChatConvId(convId);
                  handleNavigate('messages');
                }}
                onOpenReviewModal={handleOpenReview}
              />
            )}
            {currentPage === 'impact' && <ImpactPage />}
            {currentPage === 'profile' && <ProfilePage />}
          </main>
        </div>
      ) : (
        /* Interactive Landing Page View */
        <LandingPage
          onNavigate={handleNavigate}
          onOpenListingModal={handleOpenCreateListing}
        />
      )}

      {/* Mobile Bottom Navigation (only in portal view) */}
      {isPortalView && (
        <MobileNav
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenCreateListing={handleOpenCreateListing}
        />
      )}

      {/* Global Modals */}
      <AuthModal />

      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        defaultModule={createListingDefaultModule}
        onSuccess={() => {
          if (currentPage === 'my-listings' || currentPage === 'explore') {
            window.location.reload();
          } else {
            handleNavigate('my-listings');
          }
        }}
      />

      <ListingDetailModal
        listing={selectedListing}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRequest={handleInitiateRequest}
        onChat={handleInitiateChat}
        onReport={(listing) =>
          handleOpenReportIssue({
            listingId: listing.id,
            userId: listing.userId,
            title: listing.title,
          })
        }
      />

      <RequestModal
        listing={requestListing}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={(convId) => {
          if (convId) setActiveChatConvId(convId);
          handleNavigate('messages');
        }}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        transactionId={reviewTxId}
        partnerName={reviewPartner}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          alert('Thank you for rating your circular exchange!');
        }}
      />

      {/* Comprehensive User Portal "Report Issue" Modal */}
      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        defaultListingId={reportIssueParams.listingId}
        defaultUserId={reportIssueParams.userId}
        defaultTitle={reportIssueParams.title}
      />

      {/* Floating AI Chatbot Assistant - only visible after logging in */}
      {user && (
        <AIChatbot
          onNavigate={handleNavigate}
          onOpenCreateListing={handleOpenCreateListing}
          onOpenReportIssue={() => handleOpenReportIssue()}
        />
      )}
    </div>
  );
};
