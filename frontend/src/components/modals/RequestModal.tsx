import React, { useState } from 'react';
import { X, Calendar, ShieldCheck, AlertTriangle, ArrowRight, HeartHandshake, MapPin } from 'lucide-react';
import { Listing } from '../../types';
import { api, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface RequestModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId?: string) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [requestedQuantity, setRequestedQuantity] = useState<string>('1');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [initialMessage, setInitialMessage] = useState<string>('');

  // Food Safety Questionnaire fields
  const [organizationName, setOrganizationName] = useState<string>(user?.organizationName || user?.fullName || '');
  const [beneficiaryCount, setBeneficiaryCount] = useState<string>('40');
  const [transportArranged, setTransportArranged] = useState<string>('Hygienic covered transport / insulated bags');
  const [foodSafetyAgreed, setFoodSafetyAgreed] = useState<boolean>(false);
  const [preferredPickupTime, setPreferredPickupTime] = useState<string>('Within 1-2 hours');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (listing) {
      setRequestedQuantity(listing.module === 'SHARE_BORROW' ? '1' : String(Math.min(Number(listing.quantity) || 1, 5)));
      setInitialMessage(
        listing.module === 'SHARE_BORROW'
          ? `Hi, I would love to borrow this for a few days!`
          : listing.module === 'FOOD_RESCUE'
          ? `Our volunteer team is nearby and ready to distribute this surplus food to eligible recipients.`
          : `Hello, I am interested in reserving this item.`
      );
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const questionnaireResponses: Record<string, any> = {};

      if (listing.module === 'FOOD_RESCUE') {
        if (!foodSafetyAgreed) {
          throw new Error('You must accept the Food Safety & Prompt Distribution agreement.');
        }
        questionnaireResponses.organizationName = organizationName;
        questionnaireResponses.beneficiaryCount = parseInt(beneficiaryCount, 10);
        questionnaireResponses.transportArranged = transportArranged;
        questionnaireResponses.preferredPickupTime = preferredPickupTime;
        questionnaireResponses.foodSafetyAgreed = true;
      }

      const res = await api.createRequest({
        listingId: listing.id,
        requestedQuantity: parseFloat(requestedQuantity) || 1,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        initialMessage,
        questionnaireResponses,
      });

      onSuccess(res.conversationId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverImg = listing.images?.[0]?.imageUrl
    ? getImageUrl(listing.images[0].imageUrl)
    : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-[#fbfdfc]">
          <div className="flex items-center gap-3">
            <img src={coverImg} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-2 py-0.5 rounded-full">
                {listing.module.replace('_', ' ')}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-0.5 truncate max-w-xs">{listing.title}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-forest-600 inline" />
                <span>{listing.neighborhood} • Provided by {listing.user?.fullName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* SHARE & BORROW specific dates */}
          {listing.module === 'SHARE_BORROW' && (
            <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 space-y-3">
              <span className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-forest-700" />
                Select Borrow Duration
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>
              </div>
              <div className="text-[11px] text-forest-800 flex justify-between items-center pt-1 border-t border-forest-100">
                <span>Security Deposit Required:</span>
                <span className="font-bold text-gray-900">
                  {Number(listing.depositAmount) > 0 ? `₹${listing.depositAmount} (Refundable)` : '₹0 (No deposit)'}
                </span>
              </div>
            </div>
          )}

          {/* FOOD RESCUE Safety Questionnaire */}
          {listing.module === 'FOOD_RESCUE' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Mandatory Food Safety Questionnaire</span>
              </div>
              <p className="text-[11px] text-amber-900">
                To guarantee hygienic distribution, please verify your recipient details before requesting surplus food.
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                    Organization / Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Portions Needed
                    </label>
                    <input
                      type="number"
                      required
                      value={requestedQuantity}
                      onChange={(e) => setRequestedQuantity(e.target.value)}
                      max={Number(listing.quantity) || 100}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Estimated People Fed
                    </label>
                    <input
                      type="number"
                      required
                      value={beneficiaryCount}
                      onChange={(e) => setBeneficiaryCount(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                    Transport & Temperature Protection
                  </label>
                  <input
                    type="text"
                    required
                    value={transportArranged}
                    onChange={(e) => setTransportArranged(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-xl bg-white"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="foodSafetyAgreed"
                    checked={foodSafetyAgreed}
                    onChange={(e) => setFoodSafetyAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="foodSafetyAgreed" className="text-[11px] text-amber-950 font-medium">
                    I confirm that this surplus food will be consumed within 3 hours under hygienic conditions and will never be resold.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Quantity selector for Surplus and Marketplace */}
          {listing.module !== 'SHARE_BORROW' && listing.module !== 'FOOD_RESCUE' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Required ({listing.quantityUnit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={Number(listing.quantity) || 9999}
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Handover Payment Method</label>
                <div className="px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium">
                  {listing.isFree ? 'Free (₹0)' : 'UPI or Cash on Handover'}
                </div>
              </div>
            </div>
          )}

          {/* Initial Message to Owner */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Message to Provider</label>
            <textarea
              rows={3}
              required
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Introduce yourself and coordinate pickup details..."
              className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
            />
          </div>

          {/* Trust Guarantee Note */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-forest-600 flex-shrink-0" />
            <span>Exact home address is disclosed only once the provider approves your request.</span>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Submit Request & Open Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
