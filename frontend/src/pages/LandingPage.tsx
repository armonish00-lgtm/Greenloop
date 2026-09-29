import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Repeat,
  UtensilsCrossed,
  Factory,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Users,
  Building2,
  Heart,
  ChevronRight,
  Calculator,
  Leaf,
  Sprout,
  Recycle,
  GraduationCap,
  Scissors,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AreaPickerModal } from '../components/modals/AreaPickerModal';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onOpenListingModal: (module?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenListingModal }) => {
  const { user, openAuthModal } = useAuth();

  // Guest neighborhood exploration state
  const [isAreaPickerOpen, setIsAreaPickerOpen] = useState<boolean>(false);
  const [targetFeatureToExplore, setTargetFeatureToExplore] = useState<string>('explore');

  const handleExploreFeature = (feature: string = 'explore') => {
    if (!user) {
      setTargetFeatureToExplore(feature);
      setIsAreaPickerOpen(true);
    } else {
      onNavigate(feature);
    }
  };

  const handleAreaSelected = (area: string, feature?: string) => {
    onNavigate(feature || 'explore');
  };

  // Interactive Loop Simulator State
  const [activeLoopIndex, setActiveLoopIndex] = useState<number>(0);

  // Interactive How-it-Works step state
  const [activeStep, setActiveStep] = useState<number>(0);

  // Interactive Impact Calculator State
  const [communityMembers, setCommunityMembers] = useState<number>(250);
  const [exchangeFrequency, setExchangeFrequency] = useState<number>(2); // exchanges per member/month

  // Interactive "Built for Communities" tab state
  const [selectedCommunityTab, setSelectedCommunityTab] = useState<number>(0);

  // Auto-cycle circular loop simulator every 6 seconds if not hovered
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveLoopIndex((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const loopModules = [
    {
      id: 'share_borrow',
      title: 'Share & Borrow',
      IconComponent: Repeat,
      tagline: 'Lend & borrow high-utility tools & appliances locally',
      metric: '92% Average Savings vs Buying New',
      carbonFactor: '14.5 kg CO2e / exchange',
      color: 'from-emerald-600 to-forest-700',
      accentBg: 'bg-forest-50',
      accentBorder: 'border-forest-200',
      badgeColor: 'bg-forest-100 text-forest-800',
      story: 'Karthik in T. Nagar borrowed a Bosch hammer drill from Ananya in Anna Nagar for 2 days to mount shelves. Cost: ₹0. Carbon emissions avoided: 14.5 kg.',
      steps: ['Browse tools within 3 km', 'Pick dates & deposit', 'Pick up & inspect', 'Return & rate'],
    },
    {
      id: 'food_rescue',
      title: 'Food Rescue',
      IconComponent: UtensilsCrossed,
      tagline: 'Connect surplus banquet and restaurant food with verified NGOs',
      metric: '18,450+ Hot Meals Rescued in Chennai',
      carbonFactor: '2.1 kg CO2e / meal box',
      color: 'from-amber-500 to-orange-600',
      accentBg: 'bg-amber-50',
      accentBorder: 'border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
      story: 'A wedding reception in Adyar posted 70 meal boxes. Robin Hood Army was notified instantly, completed safety verification, and distributed dinner to a senior care home within 90 minutes.',
      steps: ['Donor posts portions & expiry', 'NGO answers safety questionnaire', 'Instant coordination in chat', 'Hygienic distribution'],
    },
    {
      id: 'industrial_surplus',
      title: 'Industrial Surplus',
      IconComponent: Factory,
      tagline: 'Redirect raw fabric, timber, and polymer barrels into productive circular reuse',
      metric: '32+ Tons Diverted from Landfills',
      carbonFactor: '3.4 kg CO2e / kg textile',
      color: 'from-blue-600 to-indigo-700',
      accentBg: 'bg-blue-50',
      accentBorder: 'border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      story: 'Coromandel Reclaimers listed 500 kg of export-grade combed cotton fabric offcuts in Guindy. A local artisan cooperative repurposed it into 650 reusable tote bags.',
      steps: ['Business lists surplus inventory', 'Verified buyer requests batch quote', 'Real-time terms negotiation', 'Verified pickup & circular audit'],
    },
    {
      id: 'green_marketplace',
      title: 'Green Marketplace',
      IconComponent: Recycle,
      tagline: 'Buy and sell upcycled, refurbished, and zero-waste handcrafted essentials',
      metric: '100% Circular, Non-Virgin Goods',
      carbonFactor: '5.0 kg CO2e / product',
      color: 'from-teal-600 to-emerald-700',
      accentBg: 'bg-teal-50',
      accentBorder: 'border-teal-200',
      badgeColor: 'bg-teal-100 text-teal-800',
      story: 'Meera at EcoKrafts creates patchwork denim bags from discarded jeans. Neighbors reserve online and pick up locally with zero plastic packaging.',
      steps: ['Discover verified eco-goods', 'Reserve via community checkout', 'Zero-emission local pickup', 'Keep resources in circulation'],
    },
  ];

  const currentLoop = loopModules[activeLoopIndex];
  const CurrentLoopIcon = currentLoop.IconComponent;

  // Calculated Calculator Metrics
  const annualExchanges = communityMembers * exchangeFrequency * 12;
  const annualWasteAvoidedKg = Math.round(annualExchanges * 2.8);
  const annualCo2AvoidedKg = Math.round(annualExchanges * 6.5);
  const annualMoneySavedInr = Math.round(annualExchanges * 650);
  const annualMealsRescued = Math.round(annualExchanges * 1.4);

  // Built for Communities Data
  const communityTypes = [
    {
      title: 'Apartment Associations',
      IconComponent: Building2,
      summary: 'Enable 200+ residential flats to share high-pressure washers, ladders, party sound systems, and tools instead of everyone owning duplicate items.',
      metrics: '350+ kg waste avoided annually per community',
      neighborhood: 'Anna Nagar West Apartments',
    },
    {
      title: 'College & University Campuses',
      IconComponent: GraduationCap,
      summary: 'Students exchange textbooks, lab coats, drafting boards, and electronics during semester transitions, saving lakhs of rupees.',
      metrics: '₹4.2 Lakhs total student savings',
      neighborhood: 'IIT Madras & Guindy Tech Hub',
    },
    {
      title: 'NGOs & Welfare Charities',
      IconComponent: HeartHandshake,
      summary: 'Get real-time alerts when banquet halls and food festivals within 5 km have surplus hygienic meals ready for collection.',
      metrics: 'Average 45-min pickup turnaround time',
      neighborhood: 'Robin Hood Army & Chennai Mission',
    },
    {
      title: 'Small Businesses & Artisans',
      IconComponent: Scissors,
      summary: 'Source affordable reclaimed cotton, glass bottles, and wooden crates locally to create upcycled lifestyle products.',
      metrics: '60% lower raw material costs',
      neighborhood: 'Adyar Artisans Collective',
    },
    {
      title: 'Manufacturers & Logistics',
      IconComponent: Factory,
      summary: 'Monetize excess inventory, clean HDPE barrels, and shipping pallets instead of paying industrial scrap disposal contractors.',
      metrics: 'Audited circular ESG certification',
      neighborhood: 'Ambattur & Guindy Industrial Estate',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-gray-900 overflow-x-hidden selection:bg-forest-100 selection:text-forest-900">
      {/* 1. TOP HEADER / BRAND NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-forest-950">GreenLoop</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full">
                  TN
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Give Every Resource a Second Life</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-forest-700 transition-colors">
              Platform
            </button>
            <button onClick={() => handleExploreFeature('explore')} className="hover:text-forest-700 transition-colors">
              Explore Resources
            </button>
            <button onClick={() => onNavigate('impact')} className="hover:text-forest-700 transition-colors">
              Live Impact
            </button>
            <a href="#how-it-works" className="hover:text-forest-700 transition-colors">
              How It Works
            </a>
            <a href="#communities" className="hover:text-forest-700 transition-colors">
              Communities
            </a>
          </nav>

          {/* Auth & Primary CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-600/20 transition-all flex items-center gap-2"
              >
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-forest-800 hover:text-forest-950 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuthModal('register', 'dashboard')}
                  className="px-5 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-600/20 transition-all flex items-center gap-1.5"
                >
                  <span>Start Making an Impact</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-forest-100/40 via-emerald-100/30 to-amber-50/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                Community Circular Economy Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 leading-[1.12]">
              Don’t Buy New. <br />
              <span className="bg-gradient-to-r from-forest-600 via-emerald-600 to-forest-800 bg-clip-text text-transparent">
                Find What Already Exists.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              GreenLoop connects people, communities, and businesses across Chennai to share resources, rescue surplus food, reuse industrial materials, and trade sustainable goods locally.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleExploreFeature('explore')}
                className="px-7 py-3.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-lg shadow-forest-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span>Explore GreenLoop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-forest-50/80 text-gray-800 font-semibold text-sm border border-gray-200 shadow-sm transition-all"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* 3. INTERACTIVE CIRCULAR ECONOMY LOOP SIMULATOR */}
          <div
            className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
                    Live Circular Economy Engine
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-950 mt-1">
                  How One Unified Loop Eliminates Local Waste
                </h3>
              </div>

              {/* Module Switcher Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-2xl">
                {loopModules.map((mod, idx) => {
                  const ModIcon = mod.IconComponent;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveLoopIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeLoopIndex === idx
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <ModIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{mod.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Stage Visualizer */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Story & Environmental Impact */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentLoop.badgeColor} flex items-center gap-1.5`}>
                    <CurrentLoopIcon className="w-3.5 h-3.5" />
                    <span>{currentLoop.title}</span>
                  </span>
                  <span className="text-xs text-gray-400">• Real Chennai Use Case</span>
                </div>

                <h4 className="text-2xl font-extrabold text-gray-950 leading-tight">
                  {currentLoop.tagline}
                </h4>

                <p className="text-sm text-gray-600 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 leading-relaxed italic">
                  "{currentLoop.story}"
                </p>

                {/* 4 Steps Micro-timeline */}
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Interactive Lifecycle Flow:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {currentLoop.steps.map((st, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-forest-50/50 border border-forest-100">
                        <span className="text-[10px] font-extrabold text-forest-700 block mb-0.5">
                          Step 0{i + 1}
                        </span>
                        <span className="text-xs font-semibold text-gray-800 leading-tight block">{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Impact Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl p-6 bg-gradient-to-br from-forest-900 via-forest-950 to-gray-950 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-forest-500/10 rounded-full blur-2xl pointer-events-none" />

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest-400">
                    Calculated Carbon Reduction
                  </span>

                  <div className="mt-2 text-3xl font-extrabold text-white">
                    {currentLoop.carbonFactor}
                  </div>
                  <p className="text-xs text-forest-200 mt-0.5">Avoided lifecycle emissions</p>

                  <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Platform Metric:</span>
                      <span className="font-bold text-forest-300">{currentLoop.metric}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Hub Coverage:</span>
                      <span className="font-bold text-white">6 Chennai Metropolitan Zones</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Verification Level:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Community Audited
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (currentLoop.id === 'share_borrow') handleExploreFeature('share-borrow');
                      else if (currentLoop.id === 'food_rescue') handleExploreFeature('food-rescue');
                      else if (currentLoop.id === 'industrial_surplus') handleExploreFeature('industrial-surplus');
                      else handleExploreFeature('marketplace');
                    }}
                    className="w-full mt-6 py-2.5 rounded-xl bg-forest-500 hover:bg-forest-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Explore {currentLoop.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR CORE PLATFORM MODULES SECTION */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              One Unified Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              Four Modules. Zero Landfill Waste.
            </h2>
            <p className="text-sm text-gray-600">
              GreenLoop bridges household sharing, emergency food rescue, factory circularity, and sustainable craft into one frictionless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Share & Borrow */}
            <div
              onClick={() => handleExploreFeature('share-borrow')}
              className="group p-6 rounded-3xl bg-[#fcfbf9] hover:bg-white border border-gray-200/80 hover:border-forest-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Repeat className="w-6 h-6 text-forest-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-forest-700 transition-colors">
                  Share & Borrow
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  “Borrow what you need instead of buying something you rarely use.” Drills, tents, ladders, party speakers, and camping gear near you.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-forest-700">
                <span>Browse Local Gear</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Food Rescue */}
            <div
              onClick={() => handleExploreFeature('food-rescue')}
              className="group p-6 rounded-3xl bg-[#fcfbf9] hover:bg-white border border-gray-200/80 hover:border-amber-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-6 h-6 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                  Food Rescue
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  “Connect surplus food with people and organizations that need it.” Real-time alerts with safety questionnaire verification for NGOs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Rescue Surplus Food</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Industrial Surplus */}
            <div
              onClick={() => handleExploreFeature('industrial-surplus')}
              className="group p-6 rounded-3xl bg-[#fcfbf9] hover:bg-white border border-gray-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Factory className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  Industrial Surplus
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  “Give unused materials and excess inventory another productive life.” High-grade cotton scrap, HDPE storage drums, and treated pallets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>View B2B Inventory</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Green Marketplace */}
            <div
              onClick={() => handleExploreFeature('marketplace')}
              className="group p-6 rounded-3xl bg-[#fcfbf9] hover:bg-white border border-gray-200/80 hover:border-emerald-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Recycle className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  Green Marketplace
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  “Discover and sell recycled, reused, upcycled and sustainable products.” Upcycled denim totes, cold-pressed soaps, and reclaimed teakwood decor.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Shop Sustainable Goods</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW GREENLOOP WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-[#fcfbf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              How GreenLoop Works
            </h2>
            <p className="text-sm text-gray-600">
              Click through the steps below to see how local circular transactions unfold with total trust and safety.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { num: '01', title: 'Discover', desc: 'Map & radius search' },
                { num: '02', title: 'Connect', desc: 'Realtime chat & terms' },
                { num: '03', title: 'Exchange', desc: 'Verified local handover' },
                { num: '04', title: 'Make an Impact', desc: 'Audit carbon & savings' },
              ].map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    activeStep === idx
                      ? 'border-forest-600 bg-white shadow-md ring-2 ring-forest-600/20'
                      : 'border-gray-200 bg-white/50 hover:bg-white'
                  }`}
                >
                  <span className={`text-xs font-extrabold block mb-1 ${activeStep === idx ? 'text-forest-700' : 'text-gray-400'}`}>
                    Step {step.num}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                </button>
              ))}
            </div>

            {/* Interactive Step Details Card */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-bold">
                  Step 0{activeStep + 1} of 04
                </div>
                <h3 className="text-2xl font-bold text-gray-950">
                  {activeStep === 0 && '1. Discover Resources Within Walking Radius'}
                  {activeStep === 1 && '2. Connect Directly with Verified Neighbors'}
                  {activeStep === 2 && '3. Safe Handover with Cash or UPI Upon Inspection'}
                  {activeStep === 3 && '4. Track Real Environmental & Monetary Savings'}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {activeStep === 0 &&
                    'Open the interactive map to see tools, surplus food, B2B raw materials, and artisanal goods located 1 to 10 km from you. Exact addresses remain masked for personal privacy until a request is confirmed.'}
                  {activeStep === 1 &&
                    'Send a borrow, rescue, or purchase inquiry in seconds. Chat in real time with the provider, coordinate pickup windows, and use suggested quick replies.'}
                  {activeStep === 2 &&
                    'Meet in person at the confirmed neighborhood spot. Inspect the item, verify its condition, and complete the exchange with ₹0 fee, cash, or direct UPI on handover without middleman charges.'}
                  {activeStep === 3 &&
                    'Once marked completed, GreenLoop immediately recalculates your personal and neighborhood impact. See exact kilograms of landfill waste diverted, CO2 avoided, and rupees saved.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('explore')}
                    className="px-5 py-2.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Try It on the Explore Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Graphic / Visual Box */}
              <div className="p-6 rounded-2xl bg-forest-50/60 border border-forest-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-forest-100 text-xs font-bold text-forest-900">
                  <span>Interactive Verification Simulation</span>
                  <span className="text-emerald-700">● Live Status</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white shadow-2xs border border-forest-100">
                    <span className="text-gray-600">Privacy Radius:</span>
                    <span className="font-semibold text-gray-900">Protected (Approx. 300m)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white shadow-2xs border border-forest-100">
                    <span className="text-gray-600">Trust & Safety:</span>
                    <span className="font-semibold text-forest-700">Verified Citizen / NGO</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white shadow-2xs border border-forest-100">
                    <span className="text-gray-600">Handover Protocol:</span>
                    <span className="font-semibold text-gray-900">Community Reservation & UPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE COMMUNITY IMPACT CALCULATOR */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Interactive Impact Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              Calculate Your Community's Potential
            </h2>
            <p className="text-sm text-gray-600">
              Adjust the sliders below to see the estimated annual environmental and financial savings GreenLoop brings to your neighborhood.
            </p>
          </div>

          <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#fcfbf9] border border-gray-200 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Sliders Column */}
            <div className="md:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Community Size (Residents / Members)
                  </label>
                  <span className="text-sm font-extrabold text-forest-700 bg-forest-100 px-2.5 py-0.5 rounded-lg">
                    {communityMembers} members
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={communityMembers}
                  onChange={(e) => setCommunityMembers(parseInt(e.target.value, 10))}
                  className="w-full accent-forest-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>50 (Small Apartment)</span>
                  <span>500 (Gated Community)</span>
                  <span>1,500+ (Campus/Ward)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Exchanges per Member / Month
                  </label>
                  <span className="text-sm font-extrabold text-forest-700 bg-forest-100 px-2.5 py-0.5 rounded-lg">
                    {exchangeFrequency} exchanges
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={exchangeFrequency}
                  onChange={(e) => setExchangeFrequency(parseInt(e.target.value, 10))}
                  className="w-full accent-forest-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1 (Occasional share)</span>
                  <span>3 (Active reuse)</span>
                  <span>6+ (Zero-waste hub)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-100 text-xs text-gray-500">
                <span className="font-bold text-gray-700">Calculation Baseline:</span> Derived from EPA Waste Reduction Model (WARM) standards and actual Chennai municipal waste divergence metrics.
              </div>
            </div>

            {/* Results Grid Column */}
            <div className="md:col-span-6 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-forest-600 text-white shadow-md">
                <span className="text-[10px] uppercase font-extrabold text-forest-200 block mb-1">
                  Landfill Diverted
                </span>
                <span className="text-2xl font-extrabold block">
                  {(annualWasteAvoidedKg / 1000).toFixed(1)} Tons
                </span>
                <span className="text-[11px] text-forest-100 mt-0.5 block">{annualWasteAvoidedKg.toLocaleString()} kg total waste</span>
              </div>

              <div className="p-4 rounded-2xl bg-forest-900 text-white shadow-md">
                <span className="text-[10px] uppercase font-extrabold text-forest-300 block mb-1">
                  CO2e Avoided
                </span>
                <span className="text-2xl font-extrabold block">
                  {(annualCo2AvoidedKg / 1000).toFixed(1)} Tons
                </span>
                <span className="text-[11px] text-forest-200 mt-0.5 block">{annualCo2AvoidedKg.toLocaleString()} kg emissions</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 block mb-1">
                  Money Saved
                </span>
                <span className="text-xl font-extrabold block text-emerald-900">
                  ₹{(annualMoneySavedInr / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">Avoided new purchases</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="text-[10px] uppercase font-extrabold text-amber-700 block mb-1">
                  Meals Rescued
                </span>
                <span className="text-xl font-extrabold block text-amber-900">
                  {annualMealsRescued.toLocaleString()}
                </span>
                <span className="text-[11px] text-amber-700 mt-0.5 block">Surplus food portions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LIVE IMPACT STATISTICS SECTION */}
      <section className="py-20 bg-forest-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#357056_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-400 bg-forest-900/60 px-3 py-1 rounded-full border border-forest-800">
              Chennai Platform Milestones
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Measurable Community Impact
            </h2>
            <p className="text-sm text-forest-200">
              Every completed transaction in GreenLoop updates real municipal sustainability records.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-forest-900/40 border border-forest-800/80 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 block mb-1">4,820+</span>
              <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">Items Shared</span>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/40 border border-forest-800/80 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 block mb-1">18,450+</span>
              <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">Meals Rescued</span>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/40 border border-forest-800/80 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 block mb-1">32+ Tons</span>
              <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">Materials Reused</span>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/40 border border-forest-800/80 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-extrabold text-teal-300 block mb-1">3,120+</span>
              <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">Products Repurposed</span>
            </div>

            <div className="p-6 rounded-2xl bg-forest-900/40 border border-forest-800/80 backdrop-blur-sm col-span-2 md:col-span-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-green-300 block mb-1">45,000+ kg</span>
              <span className="text-xs text-forest-200 font-semibold uppercase tracking-wider">Waste Avoided</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BUILT FOR COMMUNITIES SECTION */}
      <section id="communities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Hyper-Local Adaptation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
              Built for Communities
            </h2>
            <p className="text-sm text-gray-600">
              See how GreenLoop scales across colleges, apartment complexes, NGOs, and manufacturing zones.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Interactive Community Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto px-2">
              {communityTypes.map((c, idx) => {
                const TabIcon = c.IconComponent;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCommunityTab(idx)}
                    className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-2xs hover:-translate-y-0.5 ${
                      selectedCommunityTab === idx
                        ? 'bg-forest-700 text-white shadow-md shadow-forest-700/20 ring-2 ring-forest-600/30'
                        : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{c.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Community Card */}
            {(() => {
              const ActiveCommunityIcon = communityTypes[selectedCommunityTab].IconComponent;
              return (
                <div className="mt-6 p-8 rounded-3xl bg-[#fcfbf9] border border-gray-200 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center text-forest-800">
                      <ActiveCommunityIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950">
                      {communityTypes[selectedCommunityTab].title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {communityTypes[selectedCommunityTab].summary}
                    </p>
                    <div className="p-3 rounded-xl bg-forest-50 border border-forest-100 text-xs font-semibold text-forest-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-forest-700 inline" />
                      <span>Verified Local Hub: {communityTypes[selectedCommunityTab].neighborhood}</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Community Benchmark</span>
                    <div className="text-xl font-extrabold text-forest-800">
                      {communityTypes[selectedCommunityTab].metrics}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Community administrators receive an audit portal to approve listings, monitor active member requests, and generate municipal circularity certificates.
                    </p>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Join as {communityTypes[selectedCommunityTab].title.split(' ')[0]}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="py-20 bg-[#f4efe8] border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="w-14 h-14 rounded-3xl bg-forest-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Sprout className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-950 tracking-tight">
            Join the GreenLoop Community
          </h2>

          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            “Before buying something new, check whether someone nearby already has it. Before throwing something away, check whether someone else can use it.”
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                if (user) onNavigate('dashboard');
                else openAuthModal('register');
              }}
              className="px-8 py-3.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-xl shadow-forest-600/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-300 shadow-sm transition-all"
            >
              Browse Open Map
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-14 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span className="font-extrabold text-xl text-white tracking-tight">GreenLoop</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Chennai's community circular sustainability platform. Enabling local sharing, food rescue, industrial surplus repurposing, and sustainable commerce.
            </p>
            <p className="text-[11px] text-gray-500">© 2026 GreenLoop. Powered by MySQL & Node.js.</p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Modules</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('share-borrow')} className="hover:text-white">Share & Borrow</button></li>
              <li><button onClick={() => onNavigate('food-rescue')} className="hover:text-white">Food Rescue</button></li>
              <li><button onClick={() => onNavigate('industrial-surplus')} className="hover:text-white">Industrial Surplus</button></li>
              <li><button onClick={() => onNavigate('marketplace')} className="hover:text-white">Green Marketplace</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Community</h5>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('impact')} className="hover:text-white">Sustainability Impact</button></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              <li><a href="#communities" className="hover:text-white">Colleges & Campuses</a></li>
              <li><button onClick={() => onNavigate('admin')} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors"><ShieldCheck className="w-4 h-4 text-indigo-400" /><span>Governance & Admin Console</span></button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Safety</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="text-gray-400">Privacy Guidelines</span></li>
              <li><span className="text-gray-400">Food Safety Code</span></li>
              <li><span className="text-gray-400">Terms of Service</span></li>
              <li><span className="text-gray-400">Approximate Geolocation</span></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Guest Area Selection Modal */}
      <AreaPickerModal
        isOpen={isAreaPickerOpen}
        onClose={() => setIsAreaPickerOpen(false)}
        targetFeature={targetFeatureToExplore}
        onSelectArea={handleAreaSelected}
      />
    </div>
  );
};
