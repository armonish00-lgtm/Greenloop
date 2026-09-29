import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileQuestion,
  History,
  Image as ImageIcon,
  Loader2,
  Package,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultListingId?: string;
  defaultUserId?: string;
  defaultTitle?: string;
}

const ISSUE_CATEGORIES = [
  'Item damaged, broken, or not working as described',
  'Deposit, pricing, or refund dispute',
  'Unsafe, expired, or unhygienic food condition',
  'No-show / cancelled without notice at pickup time',
  'Harassment, abusive language, or inappropriate behavior',
  'Prohibited, counterfeit, or hazardous material',
  'Misleading photos or specifications',
  'Technical bug / payment processing issue',
  'Other',
];

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  defaultListingId,
  defaultUserId,
  defaultTitle,
}) => {
  const { user } = useAuth();

  // Step 1: Is this related to a previous order/exchange?
  const [isOrderRelated, setIsOrderRelated] = useState<boolean | null>(defaultListingId ? true : null);

  // Past orders fetched from backend
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(defaultListingId || '');

  // Form Fields
  const [category, setCategory] = useState<string>(ISSUE_CATEGORIES[0]);
  const [otherSpecificDetail, setOtherSpecificDetail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isOrderRelated === true) {
      loadPastOrders();
    }
  }, [isOpen, isOrderRelated]);

  const loadPastOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await api.getUserOrders();
      setPastOrders(data.orders || []);
      if (data.orders?.length > 0 && !selectedOrderId) {
        setSelectedOrderId(data.orders[0].id);
      }
    } catch (err) {
      console.warn('Could not load past exchanges:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const resetForm = () => {
    setIsOrderRelated(defaultListingId ? true : null);
    setSelectedOrderId(defaultListingId || '');
    setCategory(ISSUE_CATEGORIES[0]);
    setOtherSpecificDetail('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setTicketId(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category === 'Other' && !otherSpecificDetail.trim()) {
      setError('Please specify the details/nature of the issue you are addressing.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide detailed comments describing the issue.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const finalReason = category === 'Other' ? `Other: ${otherSpecificDetail.trim()}` : category;
      const formData = new FormData();
      formData.append('category', category);
      formData.append('reason', finalReason);
      formData.append('description', description.trim());

      // If related to an order, attach order details
      if (isOrderRelated && selectedOrderId) {
        const order = pastOrders.find((o) => o.id === selectedOrderId);
        formData.append('transactionId', order?.transaction?.id || selectedOrderId);
        if (order?.listing?.id) {
          formData.append('reportedListingId', order.listing.id);
        }
        // Determine counterparty (if I am requester, counterparty is owner; else requester)
        if (order) {
          const counterPartyId = order.requesterId === user?.id ? order.ownerId : order.requesterId;
          if (counterPartyId) {
            formData.append('reportedUserId', counterPartyId);
          }
        }
      } else if (defaultUserId) {
        formData.append('reportedUserId', defaultUserId);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.fileReport(formData);
      setTicketId(res.report?.id || 'GL-' + Math.floor(1000 + Math.random() * 9000));
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-950">Report an Issue</h3>
              <p className="text-xs text-gray-500">
                Directly submitted to GreenLoop Administration & Community Safety
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {ticketId ? (
          <div className="py-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-forest-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-forest-700" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-950">Issue Ticket Logged Successfully</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Ticket <span className="font-mono font-bold text-forest-800">#{ticketId.slice(0, 8)}</span> has been forwarded to our platform moderators. We will inspect the evidence and take appropriate action.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 max-w-sm mx-auto">
              Our admins will notify you via in-app alerts once resolved. Thank you for safeguarding our Chennai circular network.
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Check if related to previous exchange */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                Is this issue related to a previous exchange or order?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrderRelated(true)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isOrderRelated === true
                      ? 'border-forest-600 bg-forest-50/70 ring-2 ring-forest-500/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <History className={`w-4 h-4 ${isOrderRelated === true ? 'text-forest-700' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-gray-900">Yes, it's related</div>
                    <div className="text-[10px] text-gray-500">Pick from my past orders</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOrderRelated(false)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    isOrderRelated === false
                      ? 'border-forest-600 bg-forest-50/70 ring-2 ring-forest-500/20 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FileQuestion className={`w-4 h-4 ${isOrderRelated === false ? 'text-forest-700' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-xs font-bold text-gray-900">No, general issue</div>
                    <div className="text-[10px] text-gray-500">Listing, profile, or other</div>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 1A: If Yes -> Dropdown of previous orders */}
            {isOrderRelated === true && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Select Previous Exchange / Order:
                </label>
                {isLoadingOrders ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-forest-600" />
                    <span>Loading your recent exchanges...</span>
                  </div>
                ) : pastOrders.length > 0 ? (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
                  >
                    {pastOrders.map((ord) => {
                      const otherParty =
                        ord.requesterId === user?.id
                          ? ord.owner?.fullName || 'Owner'
                          : ord.requester?.fullName || 'Requester';
                      const title = ord.listing?.title || 'Resource Exchange';
                      const status = ord.status;
                      const date = new Date(ord.createdAt).toLocaleDateString();
                      return (
                        <option key={ord.id} value={ord.id}>
                          {title} — with {otherParty} ({date}) [{status}]
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No completed past orders found on your account. You can still report this as a general issue below.
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Category Selector */}
            {isOrderRelated !== null && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Issue Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If 'Other' chosen -> Ask for specific detail about the issue */}
                {category === 'Other' && (
                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-amber-950">
                      Specify the Nature of this Issue <span className="text-red-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={otherSpecificDetail}
                      onChange={(e) => setOtherSpecificDetail(e.target.value)}
                      placeholder="e.g. Unsafe meetup location, packaging contaminated, account impersonation..."
                      className="w-full px-3.5 py-2 text-xs border border-amber-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder-gray-400"
                      required
                    />
                    <p className="text-[10px] text-amber-800">
                      Please enter a brief title or description of what specifically occurred.
                    </p>
                  </div>
                )}

                {/* STEP 3: Detailed Comments */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Describe What Happened (Comments & Details):
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific details such as dates, item condition, chat agreements, or pickup discrepancies..."
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* STEP 4: Image Attachment */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Attach Screenshot or Photographic Proof (Optional):
                  </label>

                  {imagePreview ? (
                    <div className="relative inline-block mt-1">
                      <img
                        src={imagePreview}
                        alt="Proof preview"
                        className="w-28 h-28 object-cover rounded-2xl border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 hover:border-forest-500 rounded-2xl cursor-pointer hover:bg-forest-50/30 transition-all text-center">
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-gray-700">
                        Upload photo or screenshot proof
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        PNG, JPG, or WEBP up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting to Admin...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        <span>Send to Admin Portal</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
