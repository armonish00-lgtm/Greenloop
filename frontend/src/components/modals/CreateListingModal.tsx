import React, { useState } from 'react';
import { X, Upload, Sparkles, Check, Info, AlertTriangle, Sprout, Repeat, UtensilsCrossed, Factory, Recycle } from 'lucide-react';
import { api } from '../../services/api';
import { ListingModule } from '../../types';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultModule?: ListingModule;
}

const CATEGORIES_BY_MODULE: Record<ListingModule, string[]> = {
  SHARE_BORROW: ['Tools', 'Camping', 'Sports', 'Books', 'Party Supplies', 'Electronics', 'Travel', 'Home', 'Baby Equipment', 'Other'],
  FOOD_RESCUE: ['Cooked Meals', 'Raw Produce', 'Packaged Groceries', 'Bakery Items', 'Beverages', 'Catering Surplus'],
  INDUSTRIAL_SURPLUS: ['Fabric & Textiles', 'Packaging & Storage', 'Timber & Wood', 'Metals & Scrap', 'Polymers & Plastics', 'Electronic Components', 'Excess Inventory'],
  GREEN_MARKETPLACE: ['Upcycled Fashion', 'Zero Waste Living', 'Handmade Sustainable', 'Refurbished Goods', 'Organic Home Care', 'Reclaimed Decor'],
};

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultModule = 'SHARE_BORROW',
}) => {
  const [step, setStep] = useState<number>(1);
  const [module, setModule] = useState<ListingModule>(defaultModule);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<string>('0');
  const [priceUnit, setPriceUnit] = useState<string>('item');
  const [depositAmount, setDepositAmount] = useState<string>('0');
  const [quantity, setQuantity] = useState<string>('1');
  const [quantityUnit, setQuantityUnit] = useState<string>('item');
  const [neighborhood, setNeighborhood] = useState('Anna Nagar');
  const [approximateAddress, setApproximateAddress] = useState('');
  const [exactPickupAddress, setExactPickupAddress] = useState('');

  // Module Specific Attributes
  const [condition, setCondition] = useState('Good');
  const [maxBorrowDays, setMaxBorrowDays] = useState('3');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [expiresInHours, setExpiresInHours] = useState('4');
  const [materialGrade, setMaterialGrade] = useState('Industrial Grade A');
  const [sustainabilityType, setSustainabilityType] = useState('Upcycled');

  // Photo uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (defaultModule) {
      setModule(defaultModule);
      setCategory(CATEGORIES_BY_MODULE[defaultModule][0]);
    }
  }, [defaultModule, isOpen]);

  if (!isOpen) return null;

  const handleModuleSelect = (mod: ListingModule) => {
    setModule(mod);
    setCategory(CATEGORIES_BY_MODULE[mod][0]);
    if (mod === 'FOOD_RESCUE') {
      setIsFree(true);
      setQuantityUnit('portions');
    } else if (mod === 'INDUSTRIAL_SURPLUS') {
      setIsFree(false);
      setQuantityUnit('kg');
      setPriceUnit('per_kg');
    } else if (mod === 'SHARE_BORROW') {
      setIsFree(true);
      setQuantityUnit('tool');
    } else {
      setIsFree(false);
      setQuantityUnit('item');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      const previews = files.map((f) => URL.createObjectURL(f));
      setImagePreviews(previews);
    }
  };

  // Environmental impact estimation
  const qty = parseFloat(quantity) || 1;
  let estimatedWasteKg = qty * 1.0;
  let estimatedCo2Kg = qty * 1.5;

  if (module === 'SHARE_BORROW') {
    estimatedWasteKg = 3.5;
    estimatedCo2Kg = 12.0;
  } else if (module === 'FOOD_RESCUE') {
    estimatedWasteKg = qty * 0.65;
    estimatedCo2Kg = qty * 2.1;
  } else if (module === 'INDUSTRIAL_SURPLUS') {
    estimatedWasteKg = qty * 1.0;
    estimatedCo2Kg = qty * 3.4;
  } else if (module === 'GREEN_MARKETPLACE') {
    estimatedWasteKg = qty * 0.85;
    estimatedCo2Kg = qty * 5.0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('module', module);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('isFree', String(isFree));
      formData.append('price', String(isFree ? 0 : price));
      formData.append('priceUnit', priceUnit);
      formData.append('depositAmount', String(depositAmount));
      formData.append('quantity', String(quantity));
      formData.append('quantityUnit', quantityUnit);
      formData.append('neighborhood', neighborhood);
      formData.append('approximateAddress', approximateAddress || `Near ${neighborhood} Center`);
      formData.append('exactPickupAddress', exactPickupAddress || `Confidential in ${neighborhood}`);

      const metadata: Record<string, any> = {};
      if (module === 'SHARE_BORROW') {
        metadata.condition = condition;
        metadata.maxBorrowDays = parseInt(maxBorrowDays, 10);
      } else if (module === 'FOOD_RESCUE') {
        metadata.isVegetarian = isVegetarian;
        metadata.preparedAt = new Date().toISOString();
        metadata.expiresAt = new Date(Date.now() + parseInt(expiresInHours, 10) * 3600 * 1000).toISOString();
      } else if (module === 'INDUSTRIAL_SURPLUS') {
        metadata.materialGrade = materialGrade;
      } else if (module === 'GREEN_MARKETPLACE') {
        metadata.sustainabilityType = sustainabilityType;
      }
      formData.append('metadata', JSON.stringify(metadata));

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      await api.createListing(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 bg-[#fbfdfc]">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Circular Exchange</span>
            <h3 className="text-lg font-bold text-gray-900 mt-0.5">Post a Listing on GreenLoop</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Select Module
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'SHARE_BORROW', title: 'Share & Borrow', IconComponent: Repeat, desc: 'Lend gear locally' },
                { id: 'FOOD_RESCUE', title: 'Food Rescue', IconComponent: UtensilsCrossed, desc: 'Surplus to NGOs' },
                { id: 'INDUSTRIAL_SURPLUS', title: 'Ind. Surplus', IconComponent: Factory, desc: 'B2B materials' },
                { id: 'GREEN_MARKETPLACE', title: 'Green Market', IconComponent: Recycle, desc: 'Eco products' },
              ].map((m) => {
                const MIcon = m.IconComponent;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleModuleSelect(m.id as ListingModule)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      module === m.id
                        ? 'border-forest-600 bg-forest-50/60 ring-2 ring-forest-600'
                        : 'border-gray-200 hover:border-forest-200'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center mb-1 text-forest-700">
                      <MIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 leading-tight">{m.title}</h5>
                      <p className="text-[10px] text-gray-500 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Listing Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  module === 'SHARE_BORROW'
                    ? 'e.g. Bosch Hammer Drill 18V with bits'
                    : module === 'FOOD_RESCUE'
                    ? 'e.g. 50 Fresh Meal Boxes (Banquet Surplus)'
                    : module === 'INDUSTRIAL_SURPLUS'
                    ? 'e.g. 500 kg Combed Cotton Fabric Rolls'
                    : 'e.g. Upcycled Denim Patchwork Tote Bag'
                }
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 bg-white"
                >
                  {CATEGORIES_BY_MODULE[module].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Neighborhood</label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 bg-white"
                >
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="Ashok Nagar">Ashok Nagar</option>
                  <option value="Guindy">Guindy</option>
                  <option value="Guindy Industrial Estate">Guindy Industrial Estate</option>
                  <option value="Adyar">Adyar</option>
                  <option value="Velachery">Velachery</option>
                  <option value="T. Nagar">T. Nagar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe condition, specifications, and instructions..."
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
              />
            </div>
          </div>

          {/* Pricing, Quantities & Deposit */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Pricing & Availability</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeCheck"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded text-forest-600 focus:ring-forest-500"
                />
                <label htmlFor="freeCheck" className="text-xs font-semibold text-gray-700">
                  Free / Donation (₹0)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {!isFree && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="450"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Unit</label>
                <input
                  type="text"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  placeholder="item, kg, boxes"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white"
                />
              </div>
            </div>

            {module === 'SHARE_BORROW' && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Refundable Security Deposit (₹0 if none)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0"
                  className="w-full sm:w-1/2 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white"
                />
              </div>
            )}
          </div>

          {/* Module-Specific Parameters */}
          {module === 'FOOD_RESCUE' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Food Safety Parameters
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vegCheck"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                    className="rounded text-forest-600"
                  />
                  <label htmlFor="vegCheck" className="font-semibold text-gray-800">
                    100% Vegetarian
                  </label>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Available for next (hours)</label>
                  <input
                    type="number"
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Photos (Upload up to 5 images)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-forest-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs font-semibold text-forest-700">Click to upload photos</span>
                <span className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WEBP up to 10MB</span>
              </label>

              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Circular Impact Estimator Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-forest-50 to-emerald-50 border border-forest-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-600 text-white flex items-center justify-center shadow-sm">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-forest-950">Circular Impact Preview</h5>
                <p className="text-[11px] text-forest-800">
                  Your listing will keep ~<span className="font-extrabold">{estimatedWasteKg.toFixed(1)} kg</span> of resources in circulation and avoid ~<span className="font-extrabold">{estimatedCo2Kg.toFixed(1)} kg CO2e</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-md shadow-forest-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Publish Listing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
