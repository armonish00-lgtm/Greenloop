import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Plus,
  MessageSquare,
  Leaf,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenCreateListing: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  onOpenCreateListing,
}) => {
  const { user, openAuthModal } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 py-2 flex items-center justify-between">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1 ${
          currentPage === 'dashboard' ? 'text-forest-700' : 'text-gray-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Home</span>
      </button>

      <button
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center gap-1 ${
          currentPage === 'explore' ? 'text-forest-700' : 'text-gray-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Explore</span>
      </button>

      {/* Floating Center (+) Action */}
      <div className="-mt-6">
        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else onOpenCreateListing();
          }}
          className="w-12 h-12 rounded-full bg-forest-600 text-white flex items-center justify-center shadow-lg shadow-forest-600/30 hover:scale-105 active:scale-95 transition-transform border-4 border-white"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      <button
        onClick={() => onNavigate('messages')}
        className={`flex flex-col items-center gap-1 ${
          currentPage === 'messages' ? 'text-forest-700' : 'text-gray-400'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Chat</span>
      </button>

      <button
        onClick={() => onNavigate('impact')}
        className={`flex flex-col items-center gap-1 ${
          currentPage === 'impact' ? 'text-forest-700' : 'text-gray-400'
        }`}
      >
        <Leaf className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Impact</span>
      </button>
    </div>
  );
};
