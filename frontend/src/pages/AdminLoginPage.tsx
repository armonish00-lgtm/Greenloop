import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowLeft, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onExit }) => {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('admin@greenloop.demo');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await api.login({ email: email.trim(), password });
      
      if (data.user?.role !== 'COMMUNITY_ADMIN') {
        // Non-admin user attempted to access the admin portal
        localStorage.removeItem('greenloop_token');
        setErrorMessage('Access Denied: The provided account does not have platform administrative privileges. Only authorized community moderators can access this portal.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('greenloop_token', data.token);
      await refreshUser();
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-100 selection:text-purple-900 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">GreenLoop</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500">Chennai Municipal Oversight & Safety Portal</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Site</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-10 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Administrator Sign In
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated gateway for municipal monitoring, circular analytics, and dispute moderation.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@greenloop.demo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Master Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Authorized Demo Credentials:</span>
                </div>
                <p className="font-mono text-[10px] text-indigo-900">
                  User: <span className="font-bold">admin@greenloop.demo</span>
                </p>
                <p className="font-mono text-[10px] text-indigo-900">
                  Password: <span className="font-bold">Password123!</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Access Admin Console</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onExit}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                ← Return to GreenLoop Member Portal
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        GreenLoop Circular Governance Infrastructure • Chennai Node • 256-bit TLS Protected
      </footer>
    </div>
  );
};
