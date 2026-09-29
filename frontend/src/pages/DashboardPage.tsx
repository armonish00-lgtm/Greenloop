import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  ArrowRight,
  Repeat,
  UtensilsCrossed,
  Factory,
  ShoppingBag,
  MapPin,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Sprout,
  Recycle,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api, getImageUrl } from '../services/api';
import { Listing, PersonalImpact } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenCreateListing: (module?: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenCreateListing,
  onSelectListing,
}) => {
  const { user } = useAuth();
  const { neighborhood, coordinates } = useLocation();

  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [impact, setImpact] = useState<PersonalImpact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [listingsRes, impactRes] = await Promise.all([
          api.getListings({
            neighborhood: neighborhood !== 'Current Location' ? neighborhood : undefined,
            lat: coordinates.lat,
            lng: coordinates.lng,
            limit: 8,
          }),
          user ? api.getPersonalImpact().catch(() => null) : Promise.resolve(null),
        ]);

        setRecentListings(listingsRes.listings || []);
        if (impactRes) setImpact(impactRes);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [neighborhood, coordinates, user]);

  const moduleTags: Record<string, { label: string; color: string; IconComponent: React.ComponentType<{ className?: string }> }> = {
    SHARE_BORROW: { label: 'Share & Borrow', color: 'bg-forest-100 text-forest-800', IconComponent: Repeat },
    FOOD_RESCUE: { label: 'Food Rescue', color: 'bg-amber-100 text-amber-800', IconComponent: UtensilsCrossed },
    INDUSTRIAL_SURPLUS: { label: 'Industrial Surplus', color: 'bg-blue-100 text-blue-800', IconComponent: Factory },
    GREEN_MARKETPLACE: { label: 'Green Market', color: 'bg-emerald-100 text-emerald-800', IconComponent: Recycle },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. TOP GREETING & LOCATION BANNER */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-gray-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-forest-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-forest-300">
                Unified Circular Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Neighbor'}
            </h1>
            <p className="text-sm text-forest-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Showing resources near <strong className="text-white">{neighborhood}, Chennai</strong></span>
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          {impact?.summary && (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-forest-300 block">Personal Impact</span>
                <span className="text-xl font-extrabold text-white">
                  {impact.summary.totalWasteDivertedKg} kg
                </span>
                <span className="text-[11px] text-forest-200 block">Landfill avoided</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-[10px] uppercase font-bold text-forest-300 block">Circulated</span>
                <span className="text-xl font-extrabold text-white">
                  {impact.summary.totalItemsCirculated} items
                </span>
                <span className="text-[11px] text-forest-200 block">Exchanges completed</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. FOUR QUICK ACTION BUTTONS */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onOpenCreateListing('SHARE_BORROW')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 hover:border-white/30 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-forest-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Repeat className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="block truncate">+ List an Item</span>
              <span className="text-[10px] text-forest-300 font-normal">Share & Borrow</span>
            </div>
          </button>

          <button
            onClick={() => onOpenCreateListing('FOOD_RESCUE')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 hover:border-white/30 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="block truncate">+ Share Food</span>
              <span className="text-[10px] text-amber-300 font-normal">Surplus to NGOs</span>
            </div>
          </button>

          <button
            onClick={() => onOpenCreateListing('INDUSTRIAL_SURPLUS')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 hover:border-white/30 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="block truncate">+ List Surplus</span>
              <span className="text-[10px] text-blue-300 font-normal">B2B Materials</span>
            </div>
          </button>

          <button
            onClick={() => onOpenCreateListing('GREEN_MARKETPLACE')}
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 hover:border-white/30 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <span className="block truncate">+ Sell Product</span>
              <span className="text-[10px] text-emerald-300 font-normal">Eco Goods</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. FOUR MODULE SHORTCUT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'share-borrow',
            title: 'Share & Borrow',
            desc: 'Tools, tents, ladders & gear',
            icon: Repeat,
            color: 'bg-forest-50 text-forest-800 border-forest-200',
            btn: 'Borrow Gear',
          },
          {
            id: 'food-rescue',
            title: 'Food Rescue',
            desc: 'Fresh banquet meals to shelters',
            icon: UtensilsCrossed,
            color: 'bg-amber-50 text-amber-800 border-amber-200',
            btn: 'Rescue Food',
          },
          {
            id: 'industrial-surplus',
            title: 'Industrial Surplus',
            desc: 'Cotton scrap, timber, HDPE drums',
            icon: Factory,
            color: 'bg-blue-50 text-blue-800 border-blue-200',
            btn: 'Browse Stock',
          },
          {
            id: 'marketplace',
            title: 'Green Marketplace',
            desc: 'Upcycled fashion & zero-waste',
            icon: ShoppingBag,
            color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            btn: 'Shop Eco',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${item.color} border`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-forest-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-forest-700">
                <span>{item.btn}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. ACTIVE COMMUNITY RESOURCES NEAR YOU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Live Resources in Your Neighborhood</h2>
            <p className="text-xs text-gray-500">Real-time listings ready for immediate local exchange</p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            <span>View All on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : recentListings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <p className="text-sm text-gray-500">No active listings in {neighborhood} yet.</p>
            <button
              onClick={() => onOpenCreateListing()}
              className="mt-3 px-4 py-2 rounded-xl bg-forest-600 text-white text-xs font-bold"
            >
              Be the first to list an item!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.map((item) => {
              const tag = moduleTags[item.module] || { label: 'Resource', color: 'bg-gray-100 text-gray-800', IconComponent: Repeat };
              const TagIcon = tag.IconComponent;
              const coverImg = item.images?.[0]?.imageUrl
                ? getImageUrl(item.images[0].imageUrl)
                : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectListing(item)}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${tag.color} shadow-xs backdrop-blur-sm flex items-center gap-1`}>
                        <TagIcon className="w-3 h-3" />
                        <span>{tag.label}</span>
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md shadow-xs">
                        {item.isFree ? 'Free' : `₹${item.price} ${item.priceUnit || ''}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        {item.user?.role === 'BUSINESS' && (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                            <Factory className="w-2.5 h-2.5" /> Partner
                          </span>
                        )}
                        {item.user?.role === 'NGO' && (
                          <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-0.5">
                            <HeartHandshake className="w-2.5 h-2.5" /> NGO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-forest-600 inline" />
                        <span>{item.neighborhood}</span>
                      </span>
                      {item.distanceKm !== undefined && (
                        <span className="font-semibold text-forest-700">{item.distanceKm} km away</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
