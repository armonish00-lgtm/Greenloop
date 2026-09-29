import React, { useState } from 'react';
import { User, ShieldCheck, Star, MapPin, Phone, Mail, Award, Lock, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'verification'>('profile');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Verification form state
  const [docType, setDocType] = useState('NGO 80G Certificate');
  const [docUrl, setDocUrl] = useState('');
  const [verifSubmitted, setVerifSubmitted] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ bio, phoneNumber });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitVerification({
        documentType: docType,
        documentUrl: docUrl || 'https://sample-gov-portal.org/cert-1234.pdf',
      });
      setVerifSubmitted(true);
      await refreshUser();
    } catch (e: any) {
      alert(e.message || 'Verification submission failed.');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
          alt={user.fullName}
          className="w-24 h-24 rounded-3xl object-cover border-4 border-forest-100 shadow-md flex-shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 w-fit mx-auto sm:mx-0">
              {user.role.replace('_', ' ')}
            </span>
            {user.verificationStatus === 'VERIFIED' && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-forest-600" />
            <span>{user.neighborhood}, Chennai</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {Number(user.ratingAvg).toFixed(1)} ({user.ratingCount} reviews)
            </span>
          </p>

          <p className="text-xs text-gray-600 max-w-xl italic">
            "{user.bio || 'Active participant in Chennai circular economy community.'}"
          </p>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
          }`}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'privacy' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
          }`}
        >
          Privacy & Trust Settings
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'verification' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
          }`}
        >
          Document Verification
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Edit Profile</h3>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Community Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your neighbors about the tools you have, what you care about, or your circular mission..."
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {activeTab === 'privacy' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-forest-600" />
            Location & Privacy Controls
          </h3>

          <div className="space-y-3 text-xs divide-y divide-gray-100">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-gray-800">Approximate Location Protection</p>
                <p className="text-gray-500 text-[11px]">
                  Your exact home door number is never displayed on the public map. A 300m randomized radius is used.
                </p>
              </div>
              <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                Active (Enforced)
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-gray-800">Address Unlock on Acceptance</p>
                <p className="text-gray-500 text-[11px]">
                  Your pickup address is only revealed to a neighbor after you explicitly approve their request.
                </p>
              </div>
              <span className="text-forest-700 font-extrabold bg-forest-50 px-2.5 py-1 rounded-full text-[10px]">
                Secured
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <form onSubmit={handleVerificationSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Enterprise & NGO Verification
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed">
            Verified organizations receive priority food rescue alerts, trusted industrial supplier badges, and community trust privileges.
          </p>

          {verifSubmitted ? (
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-forest-600" />
              <span>Document submitted! Our community safety auditor will review it within 24 hours.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white"
                >
                  <option value="NGO 80G Certificate">NGO 80G / 12A Registration Certificate</option>
                  <option value="GSTIN Registration Certificate">GSTIN Certificate (Business Surplus)</option>
                  <option value="Community Resident ID">Apartment Resident Association ID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Document Link / PDF Verification URL</label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://drive.google.com/your-cert.pdf or government registry link"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Submit for Verification
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
