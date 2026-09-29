import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { ConversationItem, MessageItem } from '../types';

interface ChatPageProps {
  initialConversationId?: string;
  onOpenReviewModal: (transactionId: string, partnerName: string) => void;
  onNavigate: (page: string) => void;
}

const QUICK_INQUIRIES = [
  'Is this item still available for exchange?',
  'Can I arrange a pickup this weekend?',
  'What are your preferred handover hours in this neighborhood?',
  'Are there any specific condition details or dimensions?',
  'Is the price or quantity negotiable?',
];

export const ChatPage: React.FC<ChatPageProps> = ({
  initialConversationId,
  onOpenReviewModal,
  onNavigate,
}) => {
  const { user } = useAuth();
  const socket = getSocket();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [partnerTyping, setPartnerTyping] = useState<string | null>(null);
  const [isLoadingConvs, setIsLoadingConvs] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations list
  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations || []);
      if (!activeConvId && data.conversations?.length > 0) {
        setActiveConvId(data.conversations[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // 2. Load active conversation messages
  useEffect(() => {
    if (!activeConvId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await api.getMessages(activeConvId);
        setActiveConv(data.conversation);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    // Socket.IO Room Joining
    if (socket) {
      socket.emit('join_conversation', { conversationId: activeConvId });

      const handleNewMessage = (msg: MessageItem) => {
        if (msg.conversationId === activeConvId) {
          setMessages((prev) => [...prev, msg]);
        }
        // Refresh conversations preview
        loadConversations();
      };

      const handleUserTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
        if (data.userId !== user?.id) {
          setPartnerTyping(data.isTyping ? data.userName : null);
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);

      return () => {
        socket.emit('leave_conversation', { conversationId: activeConvId });
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
      };
    }
  }, [activeConvId, socket]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Send message
  const handleSendMessage = async (textToSend?: string, isQuick: boolean = false) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeConvId) return;

    if (!textToSend) setInputMessage('');

    if (socket) {
      socket.emit('send_message', {
        conversationId: activeConvId,
        content: text.trim(),
        isQuickReply: isQuick,
      });
      // Stop typing
      socket.emit('typing', { conversationId: activeConvId, isTyping: false });
    } else {
      try {
        const res = await api.sendMessage(activeConvId, text.trim(), isQuick);
        setMessages((prev) => [...prev, res.message]);
        loadConversations();
      } catch (e) {
        console.error('Error sending message:', e);
      }
    }
  };

  // Status transitions from chat
  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeConv?.requestId) return;
    try {
      const res = await api.updateRequestStatus(activeConv.requestId, newStatus);
      // Reload active conv
      const data = await api.getMessages(activeConvId!);
      setActiveConv(data.conversation);
      loadConversations();

      if (newStatus === 'COMPLETED' && res.request?.transaction?.id) {
        onOpenReviewModal(res.request.transaction.id, activeConv.otherUser?.fullName || 'Partner');
      }
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  const isOwner = user?.id === activeConv?.listing?.userId;
  const reqStatus = activeConv?.request?.status;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* 1. LEFT CONVERSATIONS INBOX */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-[#fbfdfc]">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Universal Messages</h2>
          <p className="text-xs text-gray-500">Coordinating circular exchanges</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {isLoadingConvs ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No conversations yet. Inquire or request an item on the Explore page!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const avatar = conv.otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-forest-50/80 border-l-4 border-forest-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {conv.otherUser?.organizationName || conv.otherUser?.fullName || 'Neighbor'}
                      </h4>
                      {conv.request?.status && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          conv.request.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          conv.request.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {conv.request.status}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-forest-800 truncate mb-1">
                      {conv.listing?.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {conv.latestMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT CHAT WINDOW */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header with Listing Preview Capsule & Status Bar */}
          <div className="p-4 border-b border-gray-100 bg-[#fbfdfc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Other User Profile & Listing Header */}
            <div className="flex items-center gap-3">
              <img
                src={activeConv.otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-gray-900">
                    {activeConv.otherUser?.organizationName || activeConv.otherUser?.fullName}
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-forest-600 inline" />
                    <span>{activeConv.listing?.neighborhood}</span>
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                    {activeConv.listing?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Transaction Status Controls */}
            {reqStatus && (
              <div className="flex items-center gap-2">
                {reqStatus === 'PENDING' && isOwner && (
                  <button
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    className="px-3.5 py-1.5 rounded-full bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Accept Request
                  </button>
                )}

                {reqStatus === 'ACCEPTED' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Handover & Complete</span>
                  </button>
                )}

                {reqStatus === 'COMPLETED' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transaction Completed</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Privacy Notification Banner (Exact address reveal upon acceptance) */}
          {activeConv.listing?.exactPickupAddress ? (
            <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-950 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Confirmed Pickup Address:</strong> {activeConv.listing.exactPickupAddress}
              </span>
            </div>
          ) : (
            <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>Exact address is protected and will unlock when the provider approves this request.</span>
            </div>
          )}

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfbf9]/50">
            {messages.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                      isMine
                        ? 'bg-forest-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{m.content}</p>
                    <span className={`text-[9px] block text-right mt-1 ${isMine ? 'text-forest-200' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {partnerTyping && (
              <div className="flex justify-start">
                <div className="p-2.5 rounded-2xl bg-white border border-gray-100 text-[11px] text-gray-500 italic flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
                  <span>{partnerTyping} is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inquiry Suggestions Chips (Click to populate input) */}
          <div className="px-4 py-2 border-t border-gray-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Suggested:
            </span>
            {QUICK_INQUIRIES.map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setInputMessage(qr)}
                className="px-3 py-1 rounded-full bg-white hover:bg-forest-50 hover:text-forest-800 text-[11px] text-gray-700 font-semibold whitespace-nowrap transition-colors border border-gray-200/90 shadow-2xs"
                title="Click to insert into message box"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                if (socket) {
                  socket.emit('typing', {
                    conversationId: activeConvId,
                    isTyping: e.target.value.length > 0,
                    userName: user?.fullName?.split(' ')[0],
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type your message or coordinate pickup..."
              className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600 focus:bg-white"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-full bg-forest-600 hover:bg-forest-700 text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-gray-400">
          Select a conversation from the left to start coordinating.
        </div>
      )}
    </div>
  );
};
