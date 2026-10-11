import React, { useState } from 'react';
import { Plus, Bell, Clock, ChevronDown, CheckCircle2, MessageSquare, Scissors, Receipt } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setIsBookingModalOpen, 
    setIsNewClientModalOpen,
    setIsCheckoutModalOpen,
    toasts,
    appointments 
  } = useSalon();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'today': return "Today's Schedule & Chairs";
      case 'clients': return 'Client Directory & Profiles';
      case 'bookings': return 'Booking System & Chair Manager';
      case 'billing': return 'Customer Billing & POS Invoices';
      case 'calendar': return 'Master Salon Calendar';
      case 'reminders': return 'Automated Reminders & SMS Delivery';
      case 'assistant': return 'Gemini Studio AI Assistant';
      case 'barbers': return 'Barber Shifts & Chair Roster';
      case 'inventory': return 'Barber Supplies & Inventory Control';
      case 'analytics': return 'Salon Performance & Metrics';
      case 'automations': return 'Smart Automation Engine';
      case 'settings': return 'Salon & SMS Gateway Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-[#E2E8F0] bg-white sticky top-0 z-20">
      {/* Page Title & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {getPageTitle()}
        </h1>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="hidden sm:inline">Tuesday, September 29</span>
          <span aria-hidden="true">·</span>
          <span>Keystone Flagship</span>
        </div>
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center gap-3">
        {/* + New Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-slate-800 transition-colors rounded-full text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showNewMenu && (
            <div 
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowNewMenu(false)}
            >
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  setIsBookingModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-left"
              >
                <Scissors className="w-4 h-4 text-slate-500" />
                <span>New Appointment Booking</span>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-left"
              >
                <Receipt className="w-4 h-4 text-slate-500" />
                <span>Quick POS / Customer Checkout</span>
              </button>
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  setIsNewClientModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium text-left"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                <span>Add Customer Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative text-slate-600"
            title="Notifications & SMS alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#FEE500] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-30 animate-in fade-in duration-150"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Recent Automated Dispatches</span>
                <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {toasts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No new alerts. All reminder queues nominal.
                  </div>
                ) : (
                  toasts.map((t) => (
                    <div key={t.id} className="p-2.5 bg-slate-50 rounded-xl flex items-start gap-2.5 text-left border border-slate-100">
                      <div className="p-1 rounded-md bg-white border border-slate-200 mt-0.5">
                        {t.type === 'sms' || t.type === 'whatsapp' ? (
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800">{t.title}</span>
                        <span className="text-[11px] text-slate-500 leading-snug">{t.message}</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">{t.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chair Queue / Clock Icon */}
        <div className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer" title="Salon Live Status">
          <Clock className="w-4 h-4" />
        </div>

        {/* User Avatar with Status Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="relative">
            <img
              src="/src/assets/images/barber_avatar_marcus_1790833013027.jpg"
              alt="Marcus Vance"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              onError={(e) => {
                // Fallback avatar
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
