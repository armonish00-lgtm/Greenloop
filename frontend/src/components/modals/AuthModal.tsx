import React, { useState } from 'react';
import { X, Eye, EyeOff, ShieldCheck, Check, Sprout, UserCheck, HeartHandshake, Factory } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('INDIVIDUAL');
  const [organizationName, setOrganizationName] = useState('');
  const [neighborhood, setNeighborhood] = useState('Anna Nagar');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode when opened
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-forest-600'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (!agreeTerms) {
          throw new Error('You must accept the Community Terms & Privacy Policy.');
        }
        await register({
          email,
          password,
          fullName,
          role,
          phoneNumber,
          organizationName: role !== 'INDIVIDUAL' ? organizationName : undefined,
          neighborhood,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-[#fbfdfc]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700">
                <Sprout className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {mode === 'login' ? 'Welcome Back to GreenLoop' : 'Join the GreenLoop Movement'}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === 'login'
                ? 'Sign in to share, borrow, rescue, and trade locally'
                : 'Connect with local communities to give resources a second life'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* User Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    I am joining as:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'INDIVIDUAL', label: 'Individual Citizen', IconComponent: UserCheck },
                      { id: 'NGO', label: 'NGO / Charity Organization', IconComponent: HeartHandshake },
                      { id: 'BUSINESS', label: 'Business / Manufacturer', IconComponent: Factory },
                      { id: 'COMMUNITY_ADMIN', label: 'Community Lead', IconComponent: ShieldCheck },
                    ].map((item) => {
                      const ItemIcon = item.IconComponent;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setRole(item.id as UserRole)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            role === item.id
                              ? 'border-forest-600 bg-forest-50/50 text-forest-900 font-semibold ring-1 ring-forest-600'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4 text-forest-700 shrink-0" />
                          <span className="text-xs truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {role === 'INDIVIDUAL' ? 'Full Name' : 'Representative Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  />
                </div>

                {/* Organization Name (if NGO or Business) */}
                {role !== 'INDIVIDUAL' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Organization / Business Name
                    </label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Chennai Food Rescue Foundation"
                      className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                    />
                  </div>
                )}

                {/* Neighborhood Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Primary Neighborhood (Chennai)
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 bg-white"
                  >
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="Ashok Nagar">Ashok Nagar</option>
                    <option value="Guindy">Guindy</option>
                    <option value="Guindy Industrial Estate">Guindy Industrial Estate</option>
                    <option value="Adyar">Adyar</option>
                    <option value="Velachery">Velachery</option>
                    <option value="T. Nagar">T. Nagar</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number (for pickup coordination)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator (register mode) */}
              {mode === 'register' && password && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-all ${
                          strengthScore >= level ? strengthColors[strengthScore - 1] : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Strength: <span className="font-bold">{strengthLabels[strengthScore - 1] || 'Too weak'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password (register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                />
              </div>
            )}

            {/* Terms checkbox */}
            {mode === 'register' && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the <span className="text-forest-700 font-semibold underline">Community Guidelines</span>, approximate location privacy, and zero-waste terms.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{mode === 'login' ? 'Sign In to GreenLoop' : 'Create My Account'}</span>
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-4 text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <span>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-forest-700 hover:underline"
                >
                  Register now
                </button>
              </span>
            ) : (
              <span>
                Already a GreenLoop member?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-forest-700 hover:underline"
                >
                  Log in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
