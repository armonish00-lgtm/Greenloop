import React from 'react';
import { X, MapPin, Sparkles, ArrowRight, Building, Factory, Leaf, ShoppingBag, Sprout, Home, UtensilsCrossed, Wrench, Info, Globe } from 'lucide-react';
import { useLocation, CHENNAI_NEIGHBORHOODS } from '../../context/LocationContext';

interface AreaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFeature?: string; // 'share-borrow' | 'food-rescue' | 'industrial-surplus' | 'marketplace' | 'explore'
  onSelectArea: (area: string, targetFeature?: string) => void;
}

const AREAS = [
  {
    name: 'Anna Nagar',
    type: 'Residential & Food Hub',
    description: 'Active tool sharing, kitchen appliances, and banquet food rescue.',
    accent: 'bg-emerald-50 text-forest-800 border-forest-200',
    IconComponent: Sprout,
  },
  {
    name: 'Ashok Nagar',
    type: 'Community Circle',
    description: 'Neighborhood lending libraries, gardening gear, and composting hubs.',
    accent: 'bg-emerald-50 text-forest-800 border-forest-200',
    IconComponent: Home,
  },
  {
    name: 'Guindy',
    type: 'Industrial & B2B Surplus',
    description: 'Secondary raw materials, combed cotton textiles, pallets, and surplus barrels.',
    accent: 'bg-blue-50 text-blue-800 border-blue-200',
    IconComponent: Factory,
  },
  {
    name: 'Adyar',
    type: 'Artisan & Campus Green Zone',
    description: 'Upcycled lifestyle craft, student textbook exchange, and organic zero-waste goods.',
    accent: 'bg-teal-50 text-teal-800 border-teal-200',
    IconComponent: Leaf,
  },
  {
    name: 'Velachery',
    type: 'High-Density Exchange',
    description: 'Electronics, camping equipment, books, and restaurant surplus batches.',
    accent: 'bg-amber-50 text-amber-800 border-amber-200',
    IconComponent: UtensilsCrossed,
  },
  {
    name: 'T. Nagar',
    type: 'Central Community Circle',
    description: 'DIY repair kits, power tools, home appliances, and festive wear lending.',
    accent: 'bg-purple-50 text-purple-800 border-purple-200',
    IconComponent: Wrench,
  },
];

export const AreaPickerModal: React.FC<AreaPickerModalProps> = ({
  isOpen,
  onClose,
  targetFeature = 'explore',
  onSelectArea,
}) => {
  const { neighborhood, setNeighborhood } = useLocation();

  if (!isOpen) return null;

  const handlePick = (areaName: string) => {
    if (areaName !== 'All') {
      setNeighborhood(areaName);
    }
    onSelectArea(areaName, targetFeature);
    onClose();
  };

  const getFeatureLabel = () => {
    switch (targetFeature) {
      case 'share-borrow':
        return 'Share & Borrow Items';
      case 'food-rescue':
        return 'Surplus Food Rescue';
      case 'industrial-surplus':
        return 'Industrial Surplus Materials';
      case 'marketplace':
        return 'Green Marketplace';
      default:
        return 'All Circular Resources';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-forest-100 text-forest-700">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                Explore Local Circularity
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-950 mt-1">
              Select Your Area in Chennai
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Exploring <span className="font-semibold text-forest-700">{getFeatureLabel()}</span>. Choose an area to view available items near you, or explore all zones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Areas Grid */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AREAS.map((a) => {
              const AreaIcon = a.IconComponent;
              return (
                <button
                  key={a.name}
                  onClick={() => handlePick(a.name)}
                    className="text-left p-4 rounded-2xl border border-gray-200 hover:border-forest-500 hover:bg-forest-50/40 transition-all group flex flex-col justify-between shadow-2xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700">
                          <AreaIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-forest-100 group-hover:text-forest-800 transition-colors">
                          {a.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-950 text-base mt-2 group-hover:text-forest-800 transition-colors">
                        {a.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                        {a.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-forest-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore this zone</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
          </div>

          {/* All Chennai Option */}
          <button
            onClick={() => handlePick('All')}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-forest-700 to-forest-900 text-white hover:from-forest-800 hover:to-black transition-all flex items-center justify-between shadow-md group mt-2"
          >
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </span>
              <div className="text-left">
                <h4 className="font-bold text-sm">Explore All Neighborhoods (Entire Chennai)</h4>
                <p className="text-xs text-forest-200">
                  Browse all active resources across every Chennai circle without location filtering.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/15 group-hover:bg-white/25 transition-colors">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Footer note */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-forest-600 inline" />
            <span>You can switch your neighborhood anytime from the top bar.</span>
          </span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
