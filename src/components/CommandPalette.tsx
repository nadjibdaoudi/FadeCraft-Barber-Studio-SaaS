import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  User, 
  Scissors, 
  Calendar, 
  Sparkles, 
  Settings, 
  ArrowRight,
  Package,
  Bot,
  Receipt
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    setActiveTab, 
    clients, 
    setSelectedClient, 
    setIsBookingModalOpen,
    setIsNewClientModalOpen,
    setIsCheckoutModalOpen 
  } = useSalon();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const quickActions = [
    { label: 'Point of Sale (POS) · Customer Checkout Register', icon: Receipt, action: () => setIsCheckoutModalOpen(true) },
    { label: 'Open Customer Billing & Invoices Ledger', icon: Receipt, action: () => setActiveTab('billing') },
    { label: 'Ask Gemini Studio AI Assistant (Concierge / Formulas / Strategy)', icon: Bot, action: () => setActiveTab('assistant') },
    { label: 'Create New Appointment Booking', icon: Scissors, action: () => setIsBookingModalOpen(true) },
    { label: 'Track Barber Supplies & Low-Stock Alerts', icon: Package, action: () => setActiveTab('inventory') },
    { label: 'Add New Customer Profile', icon: User, action: () => setIsNewClientModalOpen(true) },
    { label: 'Manage Barber Shifts & Breaks', icon: Calendar, action: () => setActiveTab('barbers') },
    { label: 'Go to Smart Automations & SMS Triggers', icon: Sparkles, action: () => setActiveTab('automations') },
    { label: 'Open Salon Settings & Gateway', icon: Settings, action: () => setActiveTab('settings') },
  ];

  const matchedClients = clients.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.stylePreferences.hairStyle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, client name, or search cut styles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-slate-900 placeholder-slate-400 outline-hidden bg-transparent font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto flex flex-col gap-1">
          {query.trim() === '' ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Quick Commands
              </span>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      action.action();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-black group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-black transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Clients Matching "{query}"
              </span>
              {matchedClients.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching clients found.
                </div>
              ) : (
                matchedClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setIsCommandPaletteOpen(false);
                      setSelectedClient(c);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{c.name}</span>
                        <span className="text-[11px] text-slate-400">{c.stylePreferences.hairStyle} · {c.phone}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      {c.loyaltyTier}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
