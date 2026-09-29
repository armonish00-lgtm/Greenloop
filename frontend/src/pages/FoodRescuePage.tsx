import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, AlertTriangle, ShieldCheck, Clock, CheckCircle2, ArrowRight, ArrowLeft, Leaf, MapPin, HeartHandshake, Factory } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { Listing } from '../types';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

interface FoodRescuePageProps {
  onSelectListing: (listing: Listing) => void;
  onOpenCreateListing: () => void;
  onNavigate?: (page: string) => void;
}

export const FoodRescuePage: React.FC<FoodRescuePageProps> = ({
  onSelectListing,
  onOpenCreateListing,
  onNavigate,
}) => {
  const { user, openAuthModal } = useAuth();
  const { neighborhood, coordinates, radiusKm } = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFood = async () => {
      setIsLoading(true);
      try {
        const data = await api.getListings({
          module: 'FOOD_RESCUE',
          neighborhood: neighborhood !== 'Current Location' ? neighborhood : undefined,
          lat: coordinates.lat,
          lng: coordinates.lng,
          radiusKm,
        });

        let results = data.listings || [];
        if (vegOnly) {
          results = results.filter((item: Listing) => item.metadata?.isVegetarian === true);
        }
        setListings(results);
      } catch (err) {
        console.error('Failed to load food rescue items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFood();
  }, [vegOnly, neighborhood, coordinates, radiusKm]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('landing')}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Back to Landing Page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/50 text-white text-xs font-bold">
              <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
              <span>Module 02</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Rescue Food. Reduce Waste.</h1>
          <p className="text-sm text-amber-100 max-w-xl">
            Connect banquet, restaurant, and function surplus food with verified organizations and eligible community shelters before it expires.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              openAuthModal('login', 'food-rescue');
            } else {
              onOpenCreateListing();
            }
          }}
          className="px-6 py-3 rounded-full bg-white text-amber-900 hover:bg-amber-50 font-bold text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-700" />
          <span>Post Surplus Food</span>
        </button>
      </div>

      {/* Food Safety & Verification Banner */}
      <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <span className="font-extrabold block">FSSAI Compliant Food Safety Protocol</span>
            <span className="text-amber-800">
              Surplus meals require questionnaire verification and insulated transport to maintain hygiene.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <input
            type="checkbox"
            id="vegFilter"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500"
          />
          <label htmlFor="vegFilter" className="font-bold text-amber-900 cursor-pointer">
            100% Vegetarian Only
          </label>
        </div>
      </div>

      {/* Food Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
          <p className="text-sm text-gray-500">No surplus food listings in this area right now.</p>
          <button
            onClick={onOpenCreateListing}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
          >
            Post surplus food donation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const coverImg = item.images?.[0]?.imageUrl
              ? getImageUrl(item.images[0].imageUrl)
              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

            const isVeg = item.metadata?.isVegetarian ?? true;

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="group bg-white rounded-3xl border border-amber-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={coverImg}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 shadow-xs backdrop-blur-sm flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3 text-amber-800" />
                      <span>{Number(item.quantity)} {item.quantityUnit}</span>
                    </span>
                    {isVeg && (
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-green-100 text-green-800 shadow-xs flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-green-700" />
                        <span>Pure Veg</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-700 text-white backdrop-blur-md">
                      Free for Verified NGOs
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-amber-800 mb-1 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Available for prompt pickup
                      </span>
                      {item.distanceKm !== undefined && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-700 inline" />
                          <span>{item.distanceKm} km away</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.user?.avatarUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                        {item.user?.organizationName || item.user?.fullName}
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectListing(item);
                      }}
                      className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Request Food
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
