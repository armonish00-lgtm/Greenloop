import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Repeat,
  UtensilsCrossed,
  Factory,
  ShoppingBag,
  MessageSquare,
  Package,
  Inbox,
  Leaf,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sprout,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explore', label: 'Explore All', icon: Compass },
    { id: 'share-borrow', label: 'Share & Borrow', icon: Repeat },
    { id: 'food-rescue', label: 'Food Rescue', icon: UtensilsCrossed },
    { id: 'industrial-surplus', label: 'Industrial Surplus', icon: Factory },
    { id: 'marketplace', label: 'Green Marketplace', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'my-listings', label: 'My Listings', icon: Package },
    { id: 'my-requests', label: 'My Requests', icon: Inbox },
    { id: 'impact', label: 'My Green Impact', icon: Leaf },
    { id: 'profile', label: 'Profile & Trust', icon: UserIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-4rem)] p-4 justify-between sticky top-16 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
      <div>
        {/* Brand Header */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 px-3 py-2 mb-4 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-forest-950 flex items-center gap-1.5">
              GreenLoop
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-forest-100 text-forest-800 tracking-wider">
                TN
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium -mt-0.5">Circular Sustainability</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-forest-600 text-white shadow-sm shadow-forest-600/20 translate-x-1'
                    : 'text-gray-600 hover:text-forest-900 hover:bg-forest-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Summary */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        {/* User Card */}
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">{user.fullName}</p>
                <p className="text-[10px] text-gray-500 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center p-2">
            <p className="text-[11px] text-gray-500 mb-2">Join Chennai's circular network</p>
          </div>
        )}
      </div>
    </aside>
  );
};
