import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Award, Info, Share2, Download, ArrowUpRight, CheckCircle2, Sprout, Repeat, UtensilsCrossed, Factory, Recycle, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PersonalImpact, CommunityImpact } from '../types';

export const ImpactPage: React.FC = () => {
  const { user } = useAuth();
  const [personalImpact, setPersonalImpact] = useState<PersonalImpact | null>(null);
  const [communityImpact, setCommunityImpact] = useState<CommunityImpact | null>(null);
  const [viewTab, setViewTab] = useState<'personal' | 'community'>('personal');
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      setIsLoading(true);
      try {
        const [pData, cData] = await Promise.all([
          api.getPersonalImpact().catch(() => null),
          api.getCommunityImpact(),
        ]);
        if (pData) setPersonalImpact(pData);
        if (cData) setCommunityImpact(cData);
      } catch (err) {
        console.error('Failed to load impact stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  const p = personalImpact?.summary || {
    totalItemsCirculated: 0,
    totalWasteDivertedKg: 0,
    totalCo2AvoidedKg: 0,
    totalMoneySavedInr: 0,
    itemsShared: 0,
    foodRescuedCount: 0,
    surplusRecoveredKg: 0,
    productsReused: 0,
  };

  const c = communityImpact?.community || {
    totalExchanges: 0,
    totalWasteKg: 0,
    totalCo2Kg: 0,
    totalMoneyInr: 0,
    activeListingsCount: 0,
    registeredUsersCount: 0,
    foodMealsCount: 0,
    toolsCirculated: 0,
    industrialKg: 0,
    marketProducts: 0,
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-gray-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-forest-300 uppercase tracking-widest flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Verified Municipal Circularity
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">My Green Impact</h1>
          <p className="text-sm text-forest-200 mt-1 max-w-xl">
            Calculated directly from your completed local exchanges using EPA lifecycle emission reduction standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>
          <button
            onClick={() => setShowCertificate(true)}
            className="px-5 py-2 rounded-full bg-forest-500 hover:bg-forest-400 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Eco Certificate</span>
          </button>
        </div>
      </div>

      {/* 2. Scope Switcher (Personal vs Community) */}
      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit text-xs font-bold">
        <button
          onClick={() => setViewTab('personal')}
          className={`px-5 py-2 rounded-xl transition-all ${
            viewTab === 'personal' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Personal Impact
        </button>
        <button
          onClick={() => setViewTab('community')}
          className={`px-5 py-2 rounded-xl transition-all ${
            viewTab === 'community' ? 'bg-white text-gray-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Chennai Community Total
        </button>
      </div>

      {/* 3. Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Waste Avoided</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-forest-700">
              {viewTab === 'personal' ? p.totalWasteDivertedKg : c.totalWasteKg}
            </span>
            <span className="text-sm font-bold text-gray-500 ml-1">kg</span>
          </div>
          <span className="text-[11px] text-forest-800 font-medium">Diverted from Perungudi landfill</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">CO2e Emissions</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-emerald-600">
              {viewTab === 'personal' ? p.totalCo2AvoidedKg : c.totalCo2Kg}
            </span>
            <span className="text-sm font-bold text-gray-500 ml-1">kg</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Lifecycle footprint prevented</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Money Saved</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{viewTab === 'personal' ? p.totalMoneySavedInr.toLocaleString() : c.totalMoneyInr.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Avoided replacement spending</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Resources Circulated</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-blue-600">
              {viewTab === 'personal' ? p.totalItemsCirculated : c.totalExchanges}
            </span>
            <span className="text-sm font-bold text-gray-500 ml-1">exchanges</span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium">Given a productive second life</span>
        </div>
      </div>

      {/* 4. Module Breakdown Progress Rings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">Circulation by Platform Module</h3>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-forest-800">
                  <Repeat className="w-3.5 h-3.5 text-forest-700" />
                  <span>Share & Borrow</span>
                </span>
                <span>{viewTab === 'personal' ? p.itemsShared : c.toolsCirculated} items</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-forest-600 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
                  <span>Food Rescued</span>
                </span>
                <span>{viewTab === 'personal' ? p.foodRescuedCount : c.foodMealsCount} meals</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-800">
                  <Factory className="w-3.5 h-3.5 text-blue-700" />
                  <span>Industrial Surplus Recovered</span>
                </span>
                <span>{viewTab === 'personal' ? p.surplusRecoveredKg : c.industrialKg} kg</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Recycle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Marketplace Products Reused</span>
                </span>
                <span>{viewTab === 'personal' ? p.productsReused : c.marketProducts} goods</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Neighborhood Distribution in Chennai */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900">Neighborhood Exchange Density</h3>
          <div className="space-y-3 pt-2">
            {communityImpact?.neighborhoodBreakdown.map((n) => (
              <div key={n.neighborhood} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 text-xs">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest-700 inline" />
                  <span>{n.neighborhood}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{n.exchanges} exchanges</span>
                  <span className="font-bold text-forest-700">{n.wasteKg} kg diverted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Carbon & Waste Calculation Methodology</h3>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                <strong>Landfill Diversion:</strong> Derived directly from product weight averages diverted from municipal collection in Greater Chennai Corporation.
              </p>
              <p>
                <strong>CO2 Reduction:</strong> Calculated using EPA WARM (Waste Reduction Model) and Ellen MacArthur Foundation indices:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Power Tools: 14.5 kg CO2e lifecycle reduction per borrow exchange</li>
                <li>Cooked Meals: 2.1 kg CO2e avoided methane per portion</li>
                <li>Cotton Scrap: 3.4 kg CO2e per kg diverted from landfill</li>
                <li>Upcycled Goods: 5.0 kg CO2e avoided virgin manufacturing</li>
              </ul>
              <p className="text-[11px] text-gray-400 italic">
                *All environmental figures are verified estimates based on recognized lifecycle assessment (LCA) standards.
              </p>
            </div>
            <button
              onClick={() => setShowMethodology(false)}
              className="w-full py-2.5 rounded-xl bg-forest-600 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 6. Eco Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gradient-to-b from-[#fbfdfc] to-[#f4efe8] rounded-3xl p-8 shadow-2xl border-4 border-forest-600 text-center space-y-4 relative">
            <div className="w-16 h-16 rounded-full bg-forest-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest-800">
                Official GreenLoop Certificate
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                Circular Champion Award
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              Presented to <strong className="text-gray-900">{user?.fullName || 'Community Member'}</strong> for actively participating in circular resource exchange in Chennai.
            </p>
            <div className="p-4 rounded-2xl bg-white border border-forest-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Waste Diverted</span>
                <span className="font-extrabold text-forest-700 text-base">{p.totalWasteDivertedKg} kg</span>
              </div>
              <div>
                <span className="text-gray-400 block">Emissions Avoided</span>
                <span className="font-extrabold text-emerald-700 text-base">{p.totalCo2AvoidedKg} kg</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              Certified by GreenLoop Community Trust & Safety Team • {new Date().getFullYear()}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-forest-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
