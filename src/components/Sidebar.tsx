import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  CalendarDays, 
  Calendar, 
  MessageSquare, 
  UserCheck, 
  TrendingUp, 
  Sparkles, 
  Settings, 
  Search,
  Scissors,
  ChevronDown,
  Package,
  Bot,
  Receipt
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsCommandPaletteOpen,
    clients,
    appointments,
    automations,
    lowStockCount
  } = useSalon();

  const totalClients = clients.length;
  const todayAppointments = appointments.filter(a => a.date === '2026-09-29').length;
  const activeAutomationsCount = automations.filter(a => a.active).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Clock },
    { id: 'clients', label: 'Clients', icon: Users, badge: totalClients.toString() },
    { id: 'bookings', label: 'Bookings & Chairs', icon: Scissors, badge: todayAppointments.toString() },
    { id: 'billing', label: 'Billing & POS', icon: Receipt, badge: '$1.4k' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reminders', label: 'Reminders & SMS', icon: MessageSquare, badge: '3' },
  ];

  const managementItems = [
    { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Gemini' },
    { id: 'barbers', label: 'Barbers & Shifts', icon: UserCheck },
    { id: 'inventory', label: 'Supplies & Inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined, badgeAlert: lowStockCount > 0 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'automations', label: 'Automations', icon: Sparkles, badgeDot: true },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#F8F9FA] border-r border-[#E2E8F0] flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="flex flex-col gap-5">
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              <span>K</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-tight">Keystone Barber</span>
              <span className="text-[11px] text-slate-500 font-normal">Downtown · 6 chairs</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

        {/* Quick Search ⌘K */}
        <button 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-xs text-xs text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all text-left group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="text-slate-500 font-medium">Search</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded border border-slate-200">
            ⌘K
          </kbd>
        </button>

        {/* WORKSPACE SECTION */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Workspace
          </span>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded-md ${
                        isActive ? 'text-slate-300 bg-white/10' : 'text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Management
          </span>
          <nav className="flex flex-col gap-0.5">
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        item.badgeAlert
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isActive ? 'text-slate-300 bg-white/10' : 'text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.badgeDot && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SYSTEM SECTION */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            System
          </span>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-black text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`} />
              <span>Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Goal Widget (matching exact reference screenshot) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">2026 Monthly Goal</span>
          <span className="text-slate-900 font-bold font-mono">78%</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-slate-900 font-mono tabular-nums tracking-tight">
            $18,420
          </span>
          <span className="text-xs text-slate-400 font-normal">of $24.0k</span>
        </div>
        {/* Yellow-highlighted progress bar matching image */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
          <div className="bg-[#FEE500] h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
        </div>
        <span className="text-[10px] text-slate-400">
          $5,580 to go · 4 chair days pending
        </span>
      </div>
    </aside>
  );
};
