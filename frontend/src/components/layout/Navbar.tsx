import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Bell,
  MessageSquare,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, CHENNAI_NEIGHBORHOODS } from '../../context/LocationContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  currentPage: string;
  onOpenCreateListing: (defaultModule?: string) => void;
  onNavigate: (page: string) => void;
  onGoBack?: () => void;
  onOpenReportIssue?: () => void;
  onSearchSelect?: (listingId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onOpenCreateListing,
  onNavigate,
  onGoBack,
  onOpenReportIssue,
  onSearchSelect,
}) => {
  const { user, openAuthModal, logout, unreadCount } = useAuth();
  const { neighborhood, setNeighborhood, detectCurrentLocation, isDetecting } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.getListings({ search: searchQuery, limit: 6 });
        setSearchResults(data.listings || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setShowNotifDropdown(!showNotifDropdown);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const moduleTags: Record<string, { label: string; color: string }> = {
    SHARE_BORROW: { label: 'Share', color: 'bg-forest-100 text-forest-800' },
    FOOD_RESCUE: { label: 'Food', color: 'bg-amber-100 text-amber-800' },
    INDUSTRIAL_SURPLUS: { label: 'Surplus', color: 'bg-blue-100 text-blue-800' },
    GREEN_MARKETPLACE: { label: 'Market', color: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Brand, Back Button & Universal Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
          {/* Working Back Button */}
          {currentPage !== 'landing' && (
            <button
              onClick={onGoBack || (() => onNavigate('landing'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-forest-100 text-gray-700 hover:text-forest-900 transition-colors text-xs font-bold shrink-0 border border-gray-200/80 shadow-2xs"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 text-forest-700" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 cursor-pointer lg:hidden flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-forest-900">GreenLoop</span>
          </div>

          {/* Universal Search Bar */}
          <div ref={searchRef} className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search drills, surplus fabric, meal boxes, denim bags..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 focus:bg-white transition-all shadow-inner"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Universal Search Results Dropdown */}
            {showSearchDropdown && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Universal Results</span>
                  <span>{searchResults.length} matches</span>
                </div>
                {searchResults.length === 0 && !isSearching && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No resources found matching "{searchQuery}"
                  </div>
                )}
                {searchResults.map((item) => {
                  const tag = moduleTags[item.module] || { label: 'Resource', color: 'bg-gray-100 text-gray-700' };
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        if (onSearchSelect) onSearchSelect(item.id);
                        onNavigate('explore');
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-forest-50/60 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tag.color}`}>
                            {tag.label}
                          </span>
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-forest-600 inline" />
                          <span>{item.neighborhood}</span>
                          <span>•</span>
                          <span>{item.distanceKm !== undefined ? `${item.distanceKm} km` : ''}</span>
                          <span>•</span>
                          <span>{item.isFree ? 'Free' : `₹${item.price}`}</span>
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Location Selector, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chennai Location Picker */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50 hover:bg-forest-100/80 text-forest-800 text-xs sm:text-sm font-medium border border-forest-200/60 transition-colors"
              title="Change neighborhood filter"
            >
              <MapPin className="w-3.5 h-3.5 text-forest-600" />
              <span className="max-w-[100px] sm:max-w-[130px] truncate">{neighborhood}</span>
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in duration-100">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Select Neighborhood</span>
                  <button
                    onClick={() => {
                      detectCurrentLocation();
                      setShowLocationDropdown(false);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:text-forest-800"
                  >
                    <Navigation className="w-3 h-3" />
                    {isDetecting ? 'Locating...' : 'Auto-detect'}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {Object.keys(CHENNAI_NEIGHBORHOODS).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setNeighborhood(loc);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between ${
                        neighborhood === loc
                          ? 'bg-forest-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{loc}</span>
                      {neighborhood === loc && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Report Issue Button (Available on user portal pages) */}
          {currentPage !== 'landing' && onOpenReportIssue && (
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  onOpenReportIssue();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-semibold border border-red-200/80 transition-colors shadow-2xs"
              title="Report an issue or dispute"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Report Issue</span>
            </button>
          )}



          {/* Quick Post Action Button */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login');
              } else {
                onOpenCreateListing();
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post</span>
          </button>

          {/* Notifications Bell */}
          {user && (
            <div ref={notifRef} className="relative">
              <button
                onClick={handleFetchNotifications}
                className="relative p-2 text-gray-500 hover:text-forest-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Notifications</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-forest-700 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-400">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.actionUrl) onNavigate(n.actionUrl.replace('/', ''));
                            setShowNotifDropdown(false);
                          }}
                          className={`p-2.5 text-left rounded-xl hover:bg-forest-50/50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-forest-50/30' : ''
                          }`}
                        >
                          <h5 className="text-xs font-bold text-gray-900">{n.title}</h5>
                          <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Login/Register */}
          {user ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-forest-200 transition-all"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-forest-200"
                />
                <span className="hidden md:inline-block text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      My Profile & Trust
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-listings');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      My Listings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-requests');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      My Requests
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('impact');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      My Green Impact
                    </button>
                  </div>
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        logout();
                        onNavigate('landing');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-forest-700 hover:text-forest-900"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 rounded-full shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
