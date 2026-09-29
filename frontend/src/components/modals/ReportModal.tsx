import React, { useState } from 'react';
import { X, ShieldAlert, AlertOctagon, Check } from 'lucide-react';
import { api } from '../../services/api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  reportedListingId?: string;
  targetTitle?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedListingId,
  targetTitle = 'Resource',
}) => {
  const [reason, setReason] = useState('Misleading or inaccurate information');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.fileReport({
        reportedUserId,
        reportedListingId,
        reason,
        description,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-gray-900">Report to Community Safety</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-700" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Report Submitted</h4>
            <p className="text-xs text-gray-500">Our safety team is reviewing this item. Thank you for protecting the community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-600 mb-2">
                Reporting: <span className="font-bold text-gray-900">{targetTitle}</span>
              </p>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white"
              >
                <option value="Misleading or inaccurate information">Misleading or inaccurate information</option>
                <option value="Safety or hygiene hazard">Safety or hygiene hazard</option>
                <option value="Commercial spam / unauthorized resale">Commercial spam / unauthorized resale</option>
                <option value="Prohibited or hazardous materials">Prohibited or hazardous materials</option>
                <option value="Inappropriate communication">Inappropriate communication</option>
                <option value="Other concern">Other concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Details & Context</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what you observed so our community moderators can investigate..."
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
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
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'File Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
