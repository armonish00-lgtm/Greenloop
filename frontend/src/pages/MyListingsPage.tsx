import React, { useState, useEffect } from 'react';
import { Package, Plus, Pause, Play, Trash2, CheckCircle2, ExternalLink, Repeat, UtensilsCrossed, Factory, Recycle } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Listing } from '../types';

interface MyListingsPageProps {
  onOpenCreateListing: () => void;
  onSelectListing: (listing: Listing) => void;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({
  onOpenCreateListing,
  onSelectListing,
}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMyListings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.getListings({
        userId: user.id,
        module: selectedTab !== 'ALL' ? selectedTab : undefined,
      });
      setListings(data.listings || []);
    } catch (err) {
      console.error('Error fetching my listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user, selectedTab]);

  const handleToggleStatus = async (item: Listing) => {
    const nextStatus = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateListingStatus(item.id, nextStatus);
      fetchMyListings();
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  const handleMarkCompleted = async (item: Listing) => {
    try {
      await api.updateListingStatus(item.id, 'COMPLETED');
      fetchMyListings();
    } catch (e: any) {
      alert(e.message || 'Action failed.');
    }
  };

  const handleDelete = async (item: Listing) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    try {
      await api.deleteListing(item.id);
      fetchMyListings();
    } catch (e: any) {
      alert(e.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wide">Resource Management</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">My Circulated Listings</h1>
          <p className="text-xs text-gray-500 mt-1">Manage everything you have shared, rescued, or listed for sale</p>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Listing</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'ALL', label: 'All Listings', IconComponent: null },
          { id: 'SHARE_BORROW', label: 'Share & Borrow', IconComponent: Repeat },
          { id: 'FOOD_RESCUE', label: 'Food Rescue', IconComponent: UtensilsCrossed },
          { id: 'INDUSTRIAL_SURPLUS', label: 'Industrial Surplus', IconComponent: Factory },
          { id: 'GREEN_MARKETPLACE', label: 'Green Market', IconComponent: Recycle },
        ].map((tab) => {
          const TabIcon = tab.IconComponent;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedTab === tab.id
                  ? 'bg-forest-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {TabIcon && <TabIcon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Listings List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">You haven't posted any listings in this category.</p>
          <button
            onClick={onOpenCreateListing}
            className="mt-3 px-4 py-2 rounded-xl bg-forest-600 text-white text-xs font-bold"
          >
            Post an Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((item) => {
            const coverImg = item.images?.[0]?.imageUrl
              ? getImageUrl(item.images[0].imageUrl)
              : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80';

            return (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-forest-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img src={coverImg} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                        item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'RESERVED' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-400">• {item.neighborhood}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">
                      {item.isFree ? 'Free' : `₹${item.price} ${item.priceUnit || ''}`} • Quantity: {Number(item.quantity)} {item.quantityUnit}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="p-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1"
                    title={item.status === 'ACTIVE' ? 'Pause Listing' : 'Activate Listing'}
                  >
                    {item.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  {item.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleMarkCompleted(item)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectListing(item)}
                    className="p-2 text-xs font-semibold rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-700 transition-colors"
                    title="View Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
