import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Scissors, 
  Star, 
  Filter, 
  Clock, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { Client } from '../types';

export const ClientsView: React.FC = () => {
  const { 
    clients, 
    setSelectedClient, 
    setIsBookingModalOpen, 
    setIsNewClientModalOpen,
    sendSimulatedReminder,
    appointments 
  } = useSalon();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.stylePreferences.hairStyle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = selectedTier === 'all' || client.loyaltyTier === selectedTier;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Customer Profile Directory</h2>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-semibold">
              {clients.length} Active Clients
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grooming blueprints, cut formulas, loyalty tracking, and automated reminder delivery channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="px-4 py-2 bg-black text-white hover:bg-slate-800 transition-colors rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client Profile</span>
          </button>
        </div>
      </div>

      {/* Search & Segmented Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, cut style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-hidden focus:border-black"
          />
        </div>

        {/* Tier filter tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 text-xs w-full sm:w-auto overflow-x-auto">
          {['all', 'Regular', 'Silver VIP', 'Gold VIP', 'Black Diamond VIP'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedTier === tier
                  ? 'bg-black text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientAppts = appointments.filter(a => a.clientId === client.id);
          const nextAppt = clientAppts[0];

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header with Avatar and Tier */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={client.avatarUrl}
                      alt={client.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-black transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-black">
                        {client.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {client.phone}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {client.email}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                    {client.loyaltyTier}
                  </span>
                </div>

                {/* Style Specs Preview */}
                <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-medium">
                    <span>Signature Cut</span>
                    <span className="font-semibold text-slate-800">{client.stylePreferences.hairStyle}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Clipper Guards</span>
                    <span>{client.stylePreferences.guardSides}</span>
                  </div>
                </div>

                {/* Loyalty Visits Progress */}
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Visits Progress</span>
                    <span className="text-slate-800 font-bold">
                      {client.loyaltyProgress.currentVisits} of {client.loyaltyProgress.targetVisits}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#FEE500] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (client.loyaltyProgress.currentVisits / client.loyaltyProgress.targetVisits) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Lifetime Spend</span>
                  <span className="font-bold font-mono text-slate-900">${client.totalSpend}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (nextAppt) {
                        sendSimulatedReminder(nextAppt.id, 'sms', 'Quick Customer Notice');
                      } else {
                        setSelectedClient(client);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-black transition-colors"
                    title="Send instant reminder"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(client);
                    }}
                    className="px-3 py-1 bg-black text-white hover:bg-slate-800 font-semibold rounded-lg transition-colors text-[11px]"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
