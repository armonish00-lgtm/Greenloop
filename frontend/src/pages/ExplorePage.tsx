import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Filter,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  Search,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Repeat,
  UtensilsCrossed,
  Factory,
  Recycle,
  HeartHandshake,
} from 'lucide-react';
import { LeafletMap } from '../components/common/LeafletMap';
import { useLocation } from '../context/LocationContext';
import { api, getImageUrl } from '../services/api';
import { Listing } from '../types';

interface ExplorePageProps {
  onSelectListing: (listing: Listing) => void;
  onNavigate?: (page: string) => void;
  initialModule?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectListing,
  onNavigate,
  initialModule,
}) => {
  const { neighborhood, coordinates, radiusKm, setRadiusKm } = useLocation();

  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>(initialModule || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialModule) {
      setSelectedModule(initialModule);
    }
  }, [initialModule]);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const data = await api.getListings({
          module: selectedModule !== 'ALL' ? selectedModule : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          isFree: freeOnly ? true : undefined,
          neighborhood: neighborhood !== 'Current Location' ? neighborhood : undefined,
          lat: coordinates.lat,
          lng: coordinates.lng,
          radiusKm,
        });
        setListings(data.listings || []);
      } catch (err) {
        console.error('Failed to fetch explore listings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [selectedModule, selectedCategory, freeOnly, neighborhood, coordinates, radiusKm]);

  const moduleColors: Record<string, { label: string; color: string; IconComponent: React.ComponentType<{ className?: string }> }> = {
    SHARE_BORROW: { label: 'Share & Borrow', color: 'bg-forest-100 text-forest-800', IconComponent: Repeat },
    FOOD_RESCUE: { label: 'Food Rescue', color: 'bg-amber-100 text-amber-800', IconComponent: UtensilsCrossed },
    INDUSTRIAL_SURPLUS: { label: 'Industrial Surplus', color: 'bg-blue-100 text-blue-800', IconComponent: Factory },
    GREEN_MARKETPLACE: { label: 'Green Market', color: 'bg-emerald-100 text-emerald-800', IconComponent: Recycle },
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & RADIUS CONTROLS */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-gray-100 hover:bg-forest-100 text-gray-700 hover:text-forest-800 transition-colors flex items-center gap-1.5 text-xs font-bold border border-gray-200/80 shadow-2xs shrink-0"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4 text-forest-700" />
              <span>Back to Home</span>
            </button>
          )}
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wide">Universal Resource Map</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Explore Nearby Circular Resources</h1>
            <p className="text-xs text-gray-500 mt-1">
              Displaying resources within <strong className="text-forest-800">{radiusKm} km</strong> of {neighborhood}, Chennai
            </p>
          </div>
        </div>

        {/* Radius Selector & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Radius selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
            {[1, 3, 5, 10].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  radiusKm === r
                    ? 'bg-forest-600 text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'both' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                viewMode === 'map' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map Only</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        {/* Module Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Modules', IconComponent: null },
            { id: 'SHARE_BORROW', label: 'Share & Borrow', IconComponent: Repeat },
            { id: 'FOOD_RESCUE', label: 'Food Rescue', IconComponent: UtensilsCrossed },
            { id: 'INDUSTRIAL_SURPLUS', label: 'Industrial Surplus', IconComponent: Factory },
            { id: 'GREEN_MARKETPLACE', label: 'Green Market', IconComponent: Recycle },
          ].map((m) => {
            const ChipIcon = m.IconComponent;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedModule === m.id
                    ? 'bg-forest-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ChipIcon && <ChipIcon className="w-3.5 h-3.5" />}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Free / Paid toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="freeOnlyCheck"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
            className="rounded text-forest-600 focus:ring-forest-500"
          />
          <label htmlFor="freeOnlyCheck" className="text-xs font-semibold text-gray-700 cursor-pointer">
            Free Only (₹0)
          </label>
        </div>
      </div>

      {/* 3. INTERACTIVE MAP & LIST LAYOUT */}
      <div className="space-y-6">
        {/* Map View */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className="relative">
            <LeafletMap
              listings={listings}
              center={coordinates}
              radiusKm={radiusKm}
              onSelectListing={onSelectListing}
              className="h-[420px] sm:h-[480px] w-full rounded-3xl overflow-hidden shadow-md border border-gray-200"
            />
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 text-[11px] font-semibold text-gray-700 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#357056]" />
                Share & Borrow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
                Food Rescue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                Industrial Surplus
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                Marketplace
              </span>
            </div>
          </div>
        )}

        {/* Results List */}
        {(viewMode === 'both' || viewMode === 'list') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Available Resources ({listings.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-64 rounded-3xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-sm text-gray-500">No resources found within {radiusKm} km of {neighborhood}.</p>
                <p className="text-xs text-gray-400 mt-1">Try expanding the radius to 5 km or 10 km.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => {
                  const tag = moduleColors[item.module] || { label: 'Resource', color: 'bg-gray-100 text-gray-800', IconComponent: Repeat };
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
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img
                          src={coverImg}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${tag.color} shadow-xs backdrop-blur-sm flex items-center gap-1`}>
                            <TagIcon className="w-3 h-3" />
                            <span>{tag.label}</span>
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md shadow-xs">
                            {item.isFree ? 'Free' : `₹${item.price} ${item.priceUnit || ''}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>{item.category}</span>
                            {item.distanceKm !== undefined && (
                              <span className="font-bold text-forest-700 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                                <span>{item.distanceKm} km away</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-gray-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                              {item.user?.fullName}
                            </span>
                            {item.user?.role === 'BUSINESS' && (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                                Partner
                              </span>
                            )}
                            {item.user?.role === 'NGO' && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                                NGO
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-forest-700 group-hover:underline flex items-center gap-1">
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
