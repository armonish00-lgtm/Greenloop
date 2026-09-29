import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  ArrowRight,
  Plus,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Compass,
  Repeat,
  UtensilsCrossed,
  Factory,
  ShoppingBag,
  Leaf,
  ShieldAlert,
} from 'lucide-react';

interface AIChatbotProps {
  onNavigate: (page: string) => void;
  onOpenCreateListing: (module?: string) => void;
  onOpenReportIssue?: () => void;
}

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: ActionButton[];
  timestamp: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  onNavigate,
  onOpenCreateListing,
  onOpenReportIssue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your GreenLoop AI Assistant. I can help you discover neighborhood resources, find the best way to share or sell items, and navigate across all platform modules. How can I help you today?',
      actions: [
        {
          label: 'I have products to share / sell',
          icon: <Plus className="w-3.5 h-3.5" />,
          action: () => handleUserSelection('I have some products I wish to add or sell. How should I proceed?'),
        },
        {
          label: 'Explore Food Rescue',
          icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
          action: () => {
            onNavigate('food-rescue');
            addAiMessage('Navigating you to the Food Rescue module where commercial and event surplus meals are redistributed to Chennai charities.', [
              { label: 'Open Food Rescue Page', action: () => onNavigate('food-rescue') },
            ]);
          },
        },
        {
          label: 'Check My Green Impact',
          icon: <Leaf className="w-3.5 h-3.5" />,
          action: () => {
            onNavigate('impact');
            addAiMessage('Opening your Green Impact dashboard to review your avoided carbon footprint, landfill diversion, and community savings.', [
              { label: 'View Impact Analytics', action: () => onNavigate('impact') },
            ]);
          },
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const addAiMessage = (text: string, actions?: ActionButton[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text,
        actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleUserSelection = (promptText: string) => {
    handleProcessUserMessage(promptText);
  };

  const generateAIResponse = (userText: string): { reply: string; actions?: ActionButton[] } => {
    const text = userText.toLowerCase().trim();

    // 1. Friendly Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|vanakkam)/i.test(text)) {
      return {
        reply: 'Hello! Great to connect with you. Welcome to GreenLoop, Chennai\'s circular sustainability platform. Are you looking to share, borrow, rescue surplus food, or repurpose industrial materials today?',
        actions: [
          { label: 'List an item to share/sell', icon: <Plus className="w-3.5 h-3.5" />, action: () => onOpenCreateListing() },
          { label: 'Browse Neighborhood Map', icon: <Compass className="w-3.5 h-3.5" />, action: () => onNavigate('explore') },
        ],
      };
    }

    // 2. User has products to add, sell, share or list
    if (
      text.includes('product') ||
      text.includes('item') ||
      text.includes('add') ||
      text.includes('sell') ||
      text.includes('share') ||
      text.includes('list') ||
      text.includes('post') ||
      text.includes('donate') ||
      text.includes('give')
    ) {
      return {
        reply: 'You can easily display your resources to people right in your locality! Here is how to choose the right option:\n\n• Share & Borrow: For household gear, power tools, ladders, or lawn equipment.\n• Food Rescue: For surplus edible food from households, caterers, or banquets.\n• Industrial Surplus: For manufacturing offcuts, timber pallets, HDPE barrels, or bulk textile scrap.\n• Green Marketplace: For upcycled, repaired, or sustainable handcrafts.\n\nWould you like me to open the listing form for you right now?',
        actions: [
          {
            label: '+ Create New Listing Now',
            icon: <Plus className="w-3.5 h-3.5" />,
            action: () => onOpenCreateListing(),
          },
          {
            label: 'Open Share & Borrow',
            icon: <Repeat className="w-3.5 h-3.5" />,
            action: () => onNavigate('share-borrow'),
          },
          {
            label: 'Open Green Marketplace',
            icon: <ShoppingBag className="w-3.5 h-3.5" />,
            action: () => onNavigate('marketplace'),
          },
        ],
      };
    }

    // 3. Food Rescue queries
    if (text.includes('food') || text.includes('meal') || text.includes('hunger') || text.includes('feed') || text.includes('banquet')) {
      return {
        reply: 'The Food Rescue module connects surplus banquet, restaurant, and household meals with verified local charities such as the Robin Hood Army. Prepared meals are claimed within an average 45-minute turnaround time.',
        actions: [
          { label: 'Explore Food Rescue', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, action: () => onNavigate('food-rescue') },
          { label: '+ Post Surplus Food', icon: <Plus className="w-3.5 h-3.5" />, action: () => onOpenCreateListing('FOOD_RESCUE') },
        ],
      };
    }

    // 4. Industrial Surplus & B2B
    if (
      text.includes('industrial') ||
      text.includes('surplus') ||
      text.includes('scrap') ||
      text.includes('pallet') ||
      text.includes('factory') ||
      text.includes('barrel') ||
      text.includes('raw material')
    ) {
      return {
        reply: 'Our Industrial Surplus hub enables factories in Ambattur, Guindy, and Sriperumbudur to monetize clean manufacturing byproducts—such as clean HDPE drums, wooden packaging crates, and reclaimed cotton trimmings.',
        actions: [
          { label: 'Browse Industrial Surplus', icon: <Factory className="w-3.5 h-3.5" />, action: () => onNavigate('industrial-surplus') },
          { label: '+ List Industrial Surplus', icon: <Plus className="w-3.5 h-3.5" />, action: () => onOpenCreateListing('INDUSTRIAL_SURPLUS') },
        ],
      };
    }

    // 5. Borrowing Tools & Equipment
    if (text.includes('borrow') || text.includes('tool') || text.includes('drill') || text.includes('ladder') || text.includes('tent') || text.includes('gear')) {
      return {
        reply: 'Through Share & Borrow, Chennai residents lend and borrow rarely used tools, camping gear, and event sound systems. Exact pickup locations remain privacy-masked until both parties confirm terms.',
        actions: [
          { label: 'Browse Share & Borrow', icon: <Repeat className="w-3.5 h-3.5" />, action: () => onNavigate('share-borrow') },
          { label: '+ List Gear to Share', icon: <Plus className="w-3.5 h-3.5" />, action: () => onOpenCreateListing('SHARE_BORROW') },
        ],
      };
    }

    // 6. Impact & Carbon metrics
    if (text.includes('impact') || text.includes('carbon') || text.includes('co2') || text.includes('saving') || text.includes('divert') || text.includes('waste')) {
      return {
        reply: 'GreenLoop uses EPA Waste Reduction Model standards to calculate actual landfill diversion, CO2 emissions avoided, and municipal financial savings for every completed circular transaction.',
        actions: [
          { label: 'View Sustainability Impact', icon: <Leaf className="w-3.5 h-3.5" />, action: () => onNavigate('impact') },
        ],
      };
    }

    // 7. Safety, Dispute, or Reporting
    if (text.includes('report') || text.includes('issue') || text.includes('scam') || text.includes('dispute') || text.includes('broken') || text.includes('problem')) {
      return {
        reply: 'Community trust and safety is our top priority. You can submit an incident report linked directly to an exchange or provider. Our municipal safety admins review proof photos and issue warning notices or suspensions.',
        actions: [
          {
            label: 'Open Report Issue Desk',
            icon: <ShieldAlert className="w-3.5 h-3.5" />,
            action: () => {
              if (onOpenReportIssue) onOpenReportIssue();
            },
          },
        ],
      };
    }

    // 8. General navigation fallback
    return {
      reply: `I understand you are asking about "${userText}". GreenLoop is designed to help your locality circulate items effortlessly. Where would you like to navigate right now?`,
      actions: [
        { label: 'Community Dashboard', action: () => onNavigate('dashboard') },
        { label: 'Explore All Resources', action: () => onNavigate('explore') },
        { label: '+ Create a New Listing', action: () => onOpenCreateListing() },
      ],
    };
  };

  const handleProcessUserMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      const response = generateAIResponse(userText);
      addAiMessage(response.reply, response.actions);
      setIsThinking(false);
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessUserMessage(input);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: 'Hello! I am your GreenLoop AI Assistant. I can help you discover neighborhood resources, find the best way to share or sell items, and navigate across all platform modules. How can I help you today?',
        actions: [
          {
            label: 'I have products to share / sell',
            icon: <Plus className="w-3.5 h-3.5" />,
            action: () => handleUserSelection('I have some products I wish to add or sell. How should I proceed?'),
          },
          {
            label: 'Explore Food Rescue',
            icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
            action: () => onNavigate('food-rescue'),
          },
          {
            label: 'Check My Green Impact',
            icon: <Leaf className="w-3.5 h-3.5" />,
            action: () => onNavigate('impact'),
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* 1. FLOATING CHATBOT TRIGGER BUTTON (Bottom-Right Corner) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-forest-200 shadow-md text-xs font-bold text-forest-900 pointer-events-none animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ask GreenLoop AI</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-forest-700 via-forest-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-forest-900/30 hover:scale-105 active:scale-95 transition-all relative border-2 border-white focus:outline-none"
            title="Open GreenLoop AI Assistant"
          >
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-forest-950" />
            </span>
          </button>
        </div>
      )}

      {/* 2. CHATBOT MODAL WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-800 to-forest-700 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">GreenLoop AI</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-forest-200">Platform & Navigation Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-forest-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-forest-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-forest-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-2xs ${
                        msg.sender === 'user'
                          ? 'bg-forest-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Actionable Clickable Navigation Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5 w-full max-w-[85%]">
                        {msg.actions.map((act, idx) => (
                          <button
                            key={idx}
                            onClick={act.action}
                            className="w-full text-left px-3 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200/80 text-[11px] font-bold transition-all flex items-center justify-between group shadow-2xs"
                          >
                            <span className="flex items-center gap-1.5">
                              {act.icon}
                              <span>{act.label}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-forest-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] p-2 bg-white rounded-2xl border border-slate-200/60 w-28">
                    <div className="w-2 h-2 rounded-full bg-forest-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-forest-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-forest-500 animate-bounce [animation-delay:0.4s]" />
                    <span>Thinking</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask GreenLoop AI anything..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 transition-all text-slate-900 bg-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-40 text-white transition-colors shadow-xs"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
