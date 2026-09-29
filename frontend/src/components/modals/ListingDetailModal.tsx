import React from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  Star,
  MessageSquare,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sprout,
  UtensilsCrossed,
  Factory,
  Recycle,
  HeartHandshake,
  UserCheck,
  Repeat,
  Package,
} from 'lucide-react';
import { Listing } from '../../types';
import { getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onRequest: (listing: Listing) => void;
  onChat: (listing: Listing) => void;
  onReport: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onRequest,
  onChat,
  onReport,
}) => {
  const { user, openAuthModal } = useAuth();

  if (!isOpen || !listing) return null;

  const coverImg = listing.images?.[0]?.imageUrl
    ? getImageUrl(listing.images[0].imageUrl)
    : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';

  const isOwner = user?.id === listing.userId;

  const moduleTitles: Record<string, { label: string; action: string; color: string; IconComponent: React.ComponentType<{ className?: string }> }> = {
    SHARE_BORROW: { label: 'Share & Borrow', action: 'Request to Borrow', color: 'bg-forest-100 text-forest-800', IconComponent: Repeat },
    FOOD_RESCUE: { label: 'Food Rescue', action: 'Rescue Surplus Food', color: 'bg-amber-100 text-amber-800', IconComponent: UtensilsCrossed },
    INDUSTRIAL_SURPLUS: { label: 'Industrial Surplus', action: 'Inquire Batch Stock', color: 'bg-blue-100 text-blue-800', IconComponent: Factory },
    GREEN_MARKETPLACE: { label: 'Green Marketplace', action: 'Reserve / Buy Item', color: 'bg-emerald-100 text-emerald-800', IconComponent: Recycle },
  };

  const meta = moduleTitles[listing.module] || moduleTitles.SHARE_BORROW;
  const MetaIcon = meta.IconComponent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-gray-900 bg-white/80 backdrop-blur-md rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Cover Image Gallery */}
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            <img src={coverImg} alt={listing.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-4 flex gap-2">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${meta.color} shadow-sm backdrop-blur-md flex items-center gap-1.5`}>
                <MetaIcon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
              </span>
            </div>
            <div className="absolute bottom-3 right-4">
              <span className="text-sm font-extrabold px-3.5 py-1.5 rounded-full bg-black/75 text-white backdrop-blur-md shadow-sm">
                {listing.isFree ? 'Free (₹0)' : `₹${listing.price} ${listing.priceUnit || ''}`}
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Category: <strong className="text-gray-800">{listing.category}</strong></span>
                {listing.distanceKm !== undefined && (
                  <span className="font-bold text-forest-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    <span>{listing.distanceKm} km away</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-950">{listing.title}</h2>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                <span>{listing.approximateAddress}</span>
              </p>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Resource Details</h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Circular Impact Box */}
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-between text-xs text-forest-950">
              <div>
                <span className="font-bold block">Estimated Circular Impact</span>
                <span className="text-forest-700 text-[11px]">
                  Keeping this resource in circulation avoids ~{Number(listing.wasteDivertedKgPerUnit)} kg of landfill waste and ~{Number(listing.co2AvoidedKgPerUnit)} kg CO2e.
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-forest-100/80 text-forest-700 flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
            </div>

            {/* Provider Profile Card */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={listing.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900">
                      {listing.user?.organizationName || listing.user?.fullName}
                    </h4>
                    {listing.user?.verificationStatus === 'VERIFIED' && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                    {listing.user?.role === 'BUSINESS' && (
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                        <Factory className="w-3 h-3 text-blue-600" />
                        Industrial Partner Listing
                      </span>
                    )}
                    {listing.user?.role === 'NGO' && (
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
                        <HeartHandshake className="w-3 h-3 text-rose-600" />
                        Registered NGO / Charity
                      </span>
                    )}
                    {listing.user?.role === 'INDIVIDUAL' && (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Community Member
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{Number(listing.user?.ratingAvg || 5.0).toFixed(1)} rating</span>
                    <span>•</span>
                    <span>Neighborhood: {listing.user?.neighborhood}</span>
                  </p>
                </div>
              </div>

              {!isOwner && (
                <button
                  onClick={() => {
                    if (!user) {
                      onClose();
                      openAuthModal('login', 'dashboard');
                    } else {
                      onChat(listing);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-forest-700 hover:bg-forest-50 border border-forest-200 rounded-full transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              )}
            </div>

            {/* Exact Address Privacy Protection notice */}
            <div className="text-[11px] text-gray-400 flex items-center justify-between pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                Exact pickup address is revealed once your request is approved.
              </span>
              <button
                onClick={() => {
                  if (!user) {
                    onClose();
                    openAuthModal('login', 'dashboard');
                  } else {
                    onReport(listing);
                  }
                }}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3" />
                Report
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-[#fbfdfc] flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Available: <strong>{Number(listing.quantity)} {listing.quantityUnit}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Close
            </button>

            {!isOwner ? (
              <button
                onClick={() => {
                  if (!user) {
                    onClose();
                    openAuthModal('login', 'dashboard');
                  } else {
                    onRequest(listing);
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20 transition-all flex items-center gap-1.5"
              >
                <span>{meta.action}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-bold text-forest-700 bg-forest-50 px-3 py-1.5 rounded-full">
                Your Listing
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
