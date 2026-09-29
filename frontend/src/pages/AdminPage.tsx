import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserX,
  CheckCircle2,
  Clock,
  History,
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Send,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  X,
  Leaf,
  LogOut,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Info,
  Repeat,
  UtensilsCrossed,
  Factory,
  Recycle,
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ReportItem, AdminAnalytics } from '../types';

interface AdminPageProps {
  onExitAdmin?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onExitAdmin }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'verifications' | 'audit'>('analytics');

  // Data states
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for reports
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL');
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  // Action Modals State
  const [actionTargetReport, setActionTargetReport] = useState<ReportItem | null>(null);
  const [actionType, setActionType] = useState<'NOTICE' | 'SUSPEND' | 'BAN' | 'DISMISS' | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [suspendDays, setSuspendDays] = useState<number>(7);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, repData, verData, logData] = await Promise.all([
        api.getAdminAnalytics().catch(() => null),
        api.getAdminReports().catch(() => ({ reports: [] })),
        api.getAdminVerifications().catch(() => ({ verifications: [] })),
        api.getAuditLogs().catch(() => ({ logs: [] })),
      ]);

      if (analyticsData) setAnalytics(analyticsData);
      setReports(repData.reports || []);
      setVerifications(verData.verifications || []);
      setAuditLogs(logData.logs || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (report: ReportItem, type: 'NOTICE' | 'SUSPEND' | 'BAN' | 'DISMISS') => {
    setActionTargetReport(report);
    setActionType(type);
    setAdminNotes('');
    if (type === 'NOTICE') {
      setNoticeMessage(
        `Official Warning from GreenLoop Safety Team: Your recent exchange regarding "${report.reason}" violates our community circular guidelines. Please ensure compliance to maintain platform access.`
      );
    } else {
      setNoticeMessage('');
    }
  };

  const handleExecuteResolution = async () => {
    if (!actionTargetReport || !actionType) return;
    setIsProcessingAction(true);

    try {
      if (actionType === 'NOTICE') {
        await api.resolveReport(actionTargetReport.id, {
          action: 'NOTICE',
          status: 'RESOLVED',
          noticeMessage,
          adminNotes: adminNotes || `Notice issued regarding ${actionTargetReport.reason}`,
        });
        alert('Official warning notice sent to the user!');
      } else if (actionType === 'SUSPEND') {
        await api.resolveReport(actionTargetReport.id, {
          action: 'SUSPEND',
          status: 'RESOLVED',
          suspendDays,
          adminNotes: adminNotes || `Suspended for ${suspendDays} days following community safety review.`,
        });
        alert(`User temporarily blocked for ${suspendDays} days.`);
      } else if (actionType === 'BAN') {
        await api.resolveReport(actionTargetReport.id, {
          action: 'BAN',
          status: 'RESOLVED',
          banReason: adminNotes || 'Permanently removed due to severe community violation.',
          adminNotes: adminNotes || 'Account banned permanently.',
        });
        alert('User has been permanently banned from GreenLoop.');
      } else if (actionType === 'DISMISS') {
        await api.resolveReport(actionTargetReport.id, {
          action: 'DISMISS',
          status: 'DISMISSED',
          adminNotes: adminNotes || 'Report investigated and dismissed.',
        });
        alert('Report dismissed.');
      }

      setActionTargetReport(null);
      setActionType(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateVerification = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.updateVerification(id, {
        status,
        notes: `Reviewed by admin on ${new Date().toLocaleDateString()}`,
      });
      loadData();
    } catch (e: any) {
      alert(e.message || 'Action failed');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'ALL') return true;
    return r.status === reportFilter;
  });

  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-24">
      {/* 1. PROFESSIONAL EXECUTIVE HEADER (LIGHT THEME) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  GreenLoop Executive Governance
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Admin Console
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Chennai Node Operational
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Auditor: <strong className="text-slate-800 font-semibold">{user?.fullName || 'Dr. Priya Sundaram'}</strong> • Ashok Nagar Central Authority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
              title="Refresh Realtime Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>



            <button
              onClick={() => {
                logout();
                if (onExitAdmin) onExitAdmin();
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200/80 transition-all flex items-center gap-1.5 shadow-2xs"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2. ADMIN NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-200/70 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistical Intelligence & Graphs</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'reports'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Issue Resolution Center</span>
            {pendingReportsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'verifications'
                ? 'bg-forest-700 text-white shadow-sm shadow-forest-700/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Organization Verifications</span>
            {verifications.filter((v) => v.status === 'PENDING_REVIEW').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-800/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Security & Audit Logs</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ============================================================ */}
        {/* TAB 1: GRAPHS & STATISTICAL INTELLIGENCE                      */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Platform Users
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {analytics?.overview?.totalUsers ?? '...'}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                  <span>{analytics?.overview?.verifiedUsers ?? 0} Verified Partners</span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Exchanges Done
                </span>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {analytics?.overview?.totalTransactions ?? '...'}
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                  Completed Chennai loops
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Waste Diverted
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {analytics?.overview?.totalWasteDivertedKg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Landfill divergence
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  CO2e Avoided
                </span>
                <div className="text-2xl font-black text-teal-700 mt-1">
                  {analytics?.overview?.totalCo2AvoidedKg ?? 0} <span className="text-sm font-normal text-slate-400">kg</span>
                </div>
                <span className="text-[10px] text-teal-600 font-semibold mt-1 block">
                  Avoided manufacturing
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Economic Value
                </span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  ₹{Number(analytics?.overview?.totalMoneySavedInr || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                  Retained in communities
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Safety Actions
                </span>
                <div className="text-2xl font-black text-purple-700 mt-1">
                  {analytics?.safety?.resolvedReports ?? 0}
                </div>
                <span className="text-[10px] text-purple-600 font-semibold mt-1 block">
                  {analytics?.safety?.noticesSent ?? 0} notices, {analytics?.safety?.bansIssued ?? 0} bans
                </span>
              </div>
            </div>

            {/* HIGH-PRECISION GRAPH ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: Circular Volume & Waste Diversion (Precision Dual-Scale Chart) */}
              <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Circular Exchange Volume & Waste Diverted Growth
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Audited monthly transaction velocity and physical landfill diversion across Chennai
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block shadow-xs" />
                      Exchanges
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-xs" />
                      Waste Diverted (kg)
                    </span>
                  </div>
                </div>

                {/* Precision SVG Chart with Grid Lines */}
                <div className="mt-6">
                  {/* Grid Lines */}
                  <div className="relative h-64 w-full flex flex-col justify-between">
                    {[
                      { label: '2,400 kg / 80 tx', top: '0%' },
                      { label: '1,800 kg / 60 tx', top: '25%' },
                      { label: '1,200 kg / 40 tx', top: '50%' },
                      { label: '600 kg / 20 tx', top: '75%' },
                      { label: '0 kg / 0 tx', top: '100%' },
                    ].map((grid, idx) => (
                      <div key={idx} className="w-full flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-24 text-right flex-shrink-0">
                          {grid.label}
                        </span>
                        <div className="w-full h-px bg-slate-100" />
                      </div>
                    ))}

                    {/* Columns Overlay */}
                    <div className="absolute left-26 right-2 bottom-0 top-0 flex items-end justify-between px-3 gap-3">
                      {[
                        { month: 'Apr', tx: 8, waste: 240, maxTx: 80, maxWaste: 2400 },
                        { month: 'May', tx: 16, waste: 460, maxTx: 80, maxWaste: 2400 },
                        { month: 'Jun', tx: 25, waste: 750, maxTx: 80, maxWaste: 2400 },
                        { month: 'Jul', tx: 38, waste: 1180, maxTx: 80, maxWaste: 2400 },
                        { month: 'Aug', tx: 52, waste: 1640, maxTx: 80, maxWaste: 2400 },
                        { month: 'Sep (Now)', tx: 68, waste: 2260, maxTx: 80, maxWaste: 2400 },
                      ].map((item, i) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center group h-full justify-end">
                          {/* Hover Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 mb-2 pointer-events-none bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl whitespace-nowrap z-20 space-y-0.5">
                            <p className="font-bold text-white border-b border-slate-700 pb-1">{item.month} Performance</p>
                            <p className="text-indigo-300 font-medium">Exchanges: <strong className="text-white">{item.tx} loops</strong></p>
                            <p className="text-emerald-300 font-medium">Diversion: <strong className="text-white">{item.waste} kg</strong></p>
                          </div>

                          {/* Dual Bars */}
                          <div className="w-full flex items-end justify-center gap-2">
                            {/* Transaction Bar */}
                            <div
                              style={{ height: `${(item.tx / item.maxTx) * 100}%` }}
                              className="w-1/2 max-w-[24px] bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                            />
                            {/* Waste Bar */}
                            <div
                              style={{ height: `${(item.waste / item.maxWaste) * 100}%` }}
                              className="w-1/2 max-w-[24px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                            />
                          </div>

                          <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 mt-2 transition-colors">
                            {item.month}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 2: Module Resource Distribution (Clean Ring Donut & Metrics) */}
              <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Circulation by Module
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proportion of circular items across the 4 platform pillars
                  </p>
                </div>

                {/* SVG Donut Ring Representation */}
                <div className="my-6 flex items-center justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Circle Background */}
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      {/* Share & Borrow (38%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray="90.7 238.7"
                        strokeDashoffset="0"
                      />
                      {/* Food Rescue (22%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeDasharray="52.5 238.7"
                        strokeDashoffset="-90.7"
                      />
                      {/* Industrial Surplus (19%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        strokeDasharray="45.3 238.7"
                        strokeDashoffset="-143.2"
                      />
                      {/* Green Marketplace (21%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="12"
                        strokeDasharray="50.2 238.7"
                        strokeDashoffset="-188.5"
                      />
                    </svg>

                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-900 block leading-none">83</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                        Active Items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categorized Progress Bars */}
                <div className="space-y-3">
                  {[
                    { name: 'Share & Borrow', count: 32, pct: 38, color: 'bg-emerald-500', IconComponent: Repeat },
                    { name: 'Food Rescue', count: 18, pct: 22, color: 'bg-amber-500', IconComponent: UtensilsCrossed },
                    { name: 'Industrial Surplus', count: 16, pct: 19, color: 'bg-blue-500', IconComponent: Factory },
                    { name: 'Green Marketplace', count: 17, pct: 21, color: 'bg-purple-500', IconComponent: Recycle },
                  ].map((m) => {
                    const ModIcon = m.IconComponent;
                    return (
                      <div key={m.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <ModIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.name}</span>
                          </span>
                          <span className="text-slate-500 font-bold">
                            {m.count} ({m.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div style={{ width: `${m.pct}%` }} className={`h-full ${m.color} rounded-full`} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Balanced distribution indicates active participation across both households & businesses.</span>
                </div>
              </div>
            </div>

            {/* HIGH-PRECISION GRAPH ROW 2: Neighborhood Activity Breakdown */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Chennai Neighborhood Circulation Density Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active circular density, exchange velocity, and waste diversion per municipal zone
                  </p>
                </div>
                <span className="text-xs text-indigo-700 font-bold px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 self-start sm:self-auto">
                  6 Core Zones Active
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Anna Nagar', zone: 'West Chennai', listings: 24, users: 18, share: '32%', color: 'bg-emerald-500' },
                  { name: 'Ashok Nagar', zone: 'Central South', listings: 19, users: 14, share: '26%', color: 'bg-indigo-600' },
                  { name: 'Guindy & Ind. Estate', zone: 'Industrial Hub', listings: 16, users: 12, share: '21%', color: 'bg-blue-600' },
                  { name: 'Adyar', zone: 'Coastal South', listings: 15, users: 11, share: '20%', color: 'bg-teal-600' },
                  { name: 'Velachery', zone: 'South Hub', listings: 13, users: 9, share: '18%', color: 'bg-amber-600' },
                  { name: 'T. Nagar', zone: 'Commercial Center', listings: 11, users: 8, share: '15%', color: 'bg-purple-600' },
                ].map((nb) => (
                  <div
                    key={nb.name}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-sm">{nb.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {nb.zone}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>Listings: <strong className="text-indigo-700">{nb.listings} items</strong></span>
                        <span>Active Members: <strong className="text-slate-900">{nb.users}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Share</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div style={{ width: nb.share }} className={`h-full ${nb.color} rounded-full`} />
                        </div>
                        <span className="text-xs font-extrabold text-slate-700">{nb.share}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ISSUE RESOLUTION CENTER (LIGHT THEME)                 */}
        {/* ============================================================ */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Filter Controls */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Community Safety & Issue Resolution Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review incident reports filed by members, inspect evidence, and enforce moderation actions.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReportFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      reportFilter === filter
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {filter === 'ALL' && 'All Tickets'}
                    {filter === 'PENDING' && 'Pending Review'}
                    {filter === 'RESOLVED' && 'Resolved'}
                    {filter === 'DISMISSED' && 'Dismissed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Reports Table / Card List */}
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900">No Tickets Found</h4>
                <p className="text-xs text-slate-500 mt-1">There are no reports matching the selected filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => {
                  const isPending = report.status === 'PENDING';
                  return (
                    <div
                      key={report.id}
                      className={`p-6 rounded-3xl bg-white border transition-all shadow-xs ${
                        isPending ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Report Details */}
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                              #{report.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                report.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : report.status === 'RESOLVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300'
                              }`}
                            >
                              {report.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              Filed on {new Date(report.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{report.reason}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                              {report.description || 'No additional comments provided by reporter.'}
                            </p>
                          </div>

                          {/* Linked Entities */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Reporter
                              </span>
                              <span className="font-bold text-slate-800">
                                {report.reporter?.fullName || 'Anonymous Member'}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {report.reporter?.email}
                              </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Reported Counterparty
                              </span>
                              <span className="font-bold text-rose-700">
                                {report.reportedUser?.fullName || 'Not directly specified'}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {report.reportedUser?.email || '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Evidence & Action Controls */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4">
                          {/* Proof Image */}
                          {report.imageUrl && (
                            <div
                              onClick={() => setSelectedProofImage(getImageUrl(report.imageUrl!))}
                              className="relative cursor-pointer group"
                            >
                              <img
                                src={getImageUrl(report.imageUrl)}
                                alt="Incident Evidence"
                                className="w-24 h-24 object-cover rounded-2xl border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> View Proof
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons (Only for Pending reports or if admin wants to take action) */}
                          {isPending && (
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => openActionModal(report, 'NOTICE')}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send Warning Notice</span>
                              </button>

                              <button
                                onClick={() => openActionModal(report, 'SUSPEND')}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Block User (Temporary)</span>
                              </button>

                              <button
                                onClick={() => openActionModal(report, 'BAN')}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Permanent Ban</span>
                              </button>

                              <button
                                onClick={() => openActionModal(report, 'DISMISS')}
                                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                              >
                                Dismiss Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: VERIFICATION MANAGEMENT (LIGHT THEME)                 */}
        {/* ============================================================ */}
        {activeTab === 'verifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  NGO & Business Circular Verification Desk
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify certificates of incorporation, NGO Darpan IDs, and FSSAI food handler licenses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifications.map((verif) => (
                <div
                  key={verif.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {verif.user?.organizationName || verif.user?.fullName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {verif.user?.role} • {verif.user?.neighborhood}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        verif.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : verif.status === 'PENDING_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {verif.status}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                    <p className="text-slate-600">
                      Document Type: <strong className="text-slate-900">{verif.documentType}</strong>
                    </p>
                    <p className="text-slate-600">
                      Submitted: <strong className="text-slate-900">{new Date(verif.createdAt).toLocaleDateString()}</strong>
                    </p>
                    {verif.documentUrl && (
                      <a
                        href={getImageUrl(verif.documentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Verification Document</span>
                      </a>
                    )}
                  </div>

                  {verif.status === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateVerification(verif.id, 'VERIFIED')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Verified Badge</span>
                      </button>
                      <button
                        onClick={() => handleUpdateVerification(verif.id, 'REJECTED')}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: IMMUTABLE AUDIT LOGS (LIGHT THEME)                    */}
        {/* ============================================================ */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Immutable Administrative Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All administrative actions (suspensions, notices, bans, verification approvals) are permanently cryptographically logged.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Type</th>
                      <th className="py-3 px-4">Target ID</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {log.admin?.fullName || 'Admin'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              log.action.includes('BAN')
                                ? 'bg-rose-100 text-rose-800'
                                : log.action.includes('SUSPEND')
                                ? 'bg-amber-100 text-amber-800'
                                : log.action.includes('NOTICE')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.targetType}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {log.targetId ? log.targetId.slice(0, 8) + '...' : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {JSON.stringify(log.details || {})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* ACTION MODAL: NOTICE / SUSPEND / BAN / DISMISS (LIGHT THEME) */}
      {/* ============================================================ */}
      {actionTargetReport && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {actionType === 'NOTICE' && <Send className="w-5 h-5 text-purple-600" />}
                {actionType === 'SUSPEND' && <Clock className="w-5 h-5 text-amber-600" />}
                {actionType === 'BAN' && <UserX className="w-5 h-5 text-rose-600" />}
                {actionType === 'DISMISS' && <CheckCircle2 className="w-5 h-5 text-slate-500" />}
                <h3 className="text-base font-extrabold text-slate-900">
                  {actionType === 'NOTICE' && 'Issue Official Warning Notice'}
                  {actionType === 'SUSPEND' && 'Enforce Temporary User Suspension'}
                  {actionType === 'BAN' && 'Permanently Ban User Account'}
                  {actionType === 'DISMISS' && 'Dismiss Incident Report'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActionTargetReport(null);
                  setActionType(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-600">
                Ticket: <strong className="text-slate-900">#{actionTargetReport.id.slice(0, 8)}</strong> — {actionTargetReport.reason}
              </p>
              <p className="text-slate-600">
                Target User: <strong className="text-rose-700">{actionTargetReport.reportedUser?.fullName || 'Not specified'}</strong>
              </p>
            </div>

            {/* Specific Form Fields */}
            {actionType === 'NOTICE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Warning Message (Sent to User Notifications):
                </label>
                <textarea
                  rows={4}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
                />
              </div>
            )}

            {actionType === 'SUSPEND' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Suspension Duration:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSuspendDays(days)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          suspendDays === days
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Suspension Reason (Visible to user upon login block):
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter reason for suspension..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
            )}

            {actionType === 'BAN' && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>Irreversible Action:</strong> Permanently bans the user from logging in, accessing the community, and freezes all active listings.</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permanent Ban Reason:
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="State the permanent violation grounds..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  />
                </div>
              </div>
            )}

            {actionType === 'DISMISS' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dismissal Notes:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Reason for dismissal (e.g. invalid report, resolved amicably)..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActionTargetReport(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleExecuteResolution}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 ${
                  actionType === 'NOTICE'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : actionType === 'SUSPEND'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : actionType === 'BAN'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {isProcessingAction ? 'Processing...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PROOF IMAGE ZOOM MODAL (LIGHT THEME)                         */}
      {/* ============================================================ */}
      {selectedProofImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setSelectedProofImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-white rounded-3xl border border-slate-200 shadow-2xl">
            <button
              onClick={() => setSelectedProofImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedProofImage}
              alt="Report Proof Evidence"
              className="max-h-[80vh] w-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
