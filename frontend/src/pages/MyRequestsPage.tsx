import React, { useState, useEffect } from 'react';
import { Inbox, MessageSquare, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { RequestItem } from '../types';

interface MyRequestsPageProps {
  onOpenChat: (conversationId: string) => void;
  onOpenReviewModal: (transactionId: string, partnerName: string) => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({
  onOpenChat,
  onOpenReviewModal,
}) => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'sent') {
        const data = await api.getMyRequests();
        setRequests(data.requests || []);
      } else {
        const data = await api.getReceivedRequests();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleUpdateStatus = async (reqId: string, status: string, partnerName?: string) => {
    try {
      const res = await api.updateRequestStatus(reqId, status);
      fetchRequests();
      if (status === 'COMPLETED' && res.request?.transaction?.id && partnerName) {
        onOpenReviewModal(res.request.transaction.id, partnerName);
      }
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pending Review</span>;
      case 'ACCEPTED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Accepted & Ready</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Completed</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Declined</span>;
      case 'CANCELLED':
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wide">Request Lifecycle</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">My Requests & Exchanges</h1>
          <p className="text-xs text-gray-500 mt-1">Track borrowing, surplus food reservations, and material orders</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'sent' ? 'bg-forest-600 text-white shadow-xs font-bold' : 'text-gray-600'
            }`}
          >
            Requests I Sent
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'received' ? 'bg-forest-600 text-white shadow-xs font-bold' : 'text-gray-600'
            }`}
          >
            Received on My Items
          </button>
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {activeTab === 'sent' ? 'You have not submitted any requests yet.' : 'No one has requested your items yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const partner = activeTab === 'sent' ? r.owner : r.requester;
            const coverImg = r.listing?.images?.[0]?.imageUrl
              ? getImageUrl(r.listing.images[0].imageUrl)
              : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';

            return (
              <div
                key={r.id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-forest-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img src={coverImg} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge(r.status)}
                      <span className="text-xs text-gray-400">• {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{r.listing?.title}</h3>
                    <p className="text-xs text-gray-500">
                      {activeTab === 'sent' ? `Owner: ${partner?.fullName}` : `Requested by: ${partner?.fullName}`} • Qty: {Number(r.requestedQuantity)}
                    </p>

                    {r.initialMessage && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl mt-2 italic">
                        "{r.initialMessage}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                  {/* Chat button */}
                  {r.conversation?.id && (
                    <button
                      onClick={() => onOpenChat(r.conversation!.id)}
                      className="px-3.5 py-1.5 rounded-full bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold transition-colors flex items-center gap-1.5 border border-forest-200"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-forest-600" />
                      <span>Chat</span>
                    </button>
                  )}

                  {/* Accept / Decline for owner */}
                  {activeTab === 'received' && r.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'ACCEPTED')}
                        className="px-3.5 py-1.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                        className="px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Complete Handover for accepted transactions */}
                  {r.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'COMPLETED', partner?.fullName)}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Complete</span>
                    </button>
                  )}

                  {/* Cancel for requester */}
                  {activeTab === 'sent' && r.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
