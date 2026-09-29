import React, { useState, useEffect } from 'react';
import { Factory, Plus, ShieldCheck, FileText, ChevronRight, Briefcase, ArrowLeft, MapPin } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { Listing } from '../types';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

interface IndustrialSurplusPageProps {
  onSelectListing: (listing: Listing) => void;
  onOpenCreateListing: () => void;
  onNavigate?: (page: string) => void;
}

const CATEGORIES = [
  'All',
  'Fabric & Textiles',
  'Packaging & Storage',
  'Timber & Wood',
  'Metals & Scrap',
  'Polymers & Plastics',
  'Electronic Components',
  'Excess Inventory',
];

export const IndustrialSurplusPage: React.FC<IndustrialSurplusPageProps> = ({
  onSelectListing,
  onOpenCreateListing,
  onNavigate,
}) => {
  const { user, openAuthModal } = useAuth();
  const { neighborhood, coordinates, radiusKm } = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSurplus = async () => {
      setIsLoading(true);
      try {
        const data = await api.getListings({
          module: 'INDUSTRIAL_SURPLUS',
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          neighborhood: neighborhood !== 'Current Location' ? neighborhood : undefined,
          lat: coordinates.lat,
          lng: coordinates.lng,
          radiusKm,
        });
        setListings(data.listings || []);
      } catch (err) {
        console.error('Failed to load surplus items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurplus();
  }, [selectedCategory, neighborhood, coordinates, radiusKm]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-gray-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('landing')}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/60 text-blue-100 text-xs font-bold">
              <Factory className="w-3.5 h-3.5 text-blue-200" />
              <span>Module 03 • B2B Circularity</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Turn Industrial Surplus Into New Resources</h1>
          <p className="text-sm text-blue-100 max-w-xl">
            Manufacturers and businesses redirect unused raw materials, roll ends, clean drums, and excess inventory to upcyclers and secondary industries.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal('login', 'industrial-surplus');
            } else {
              onOpenCreateListing();
            }
          }}
          className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>List Industrial Surplus</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
          <p className="text-sm text-gray-500">No industrial surplus listings in this category nearby.</p>
          <button
            onClick={onOpenCreateListing}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Post industrial surplus
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const coverImg = item.images?.[0]?.imageUrl
              ? getImageUrl(item.images[0].imageUrl)
              : 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="group bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={coverImg}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 shadow-xs">
                      {Number(item.quantity)} {item.quantityUnit}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md">
                      {item.isFree ? 'Free for Logistics' : `₹${item.price} / ${item.priceUnit || 'unit'}`}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-blue-800">{item.category}</span>
                      {item.distanceKm !== undefined && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-700 inline" />
                          <span>{item.distanceKm} km away</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.user?.avatarUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="truncate max-w-[130px]">
                        <span className="text-xs font-bold text-gray-900 truncate block">
                          {item.user?.organizationName || item.user?.fullName}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Enterprise
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectListing(item);
                      }}
                      className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Inquire Stock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
