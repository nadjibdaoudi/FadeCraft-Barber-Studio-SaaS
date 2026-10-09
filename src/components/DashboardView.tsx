import React, { useState } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { MONTHLY_METRICS } from '../data/mockData';
import { WalkInWaitlistSection } from './WalkInWaitlistSection';

export const DashboardView: React.FC = () => {
  const { 
    setActiveTab, 
    setSelectedClient, 
    clients, 
    appointments, 
    sendSimulatedReminder,
    updateAppointmentStatus 
  } = useSalon();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>('S');

  // Handle client selection
  const handleClientClick = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setSelectedClient(found);
    }
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      {/* TOP ROW: Large Dark Revenue Card + 4 Bento Stat Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Large Dark Revenue to Goal Card (Exact visual replica from image) */}
        <div className="xl:col-span-6 bg-[#161618] text-white rounded-3xl p-6.5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-zinc-800">
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                  ◎
                </span>
                <span className="text-xs font-medium text-zinc-300">Revenue to goal</span>
              </div>
              <div className="bg-[#242428] text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-mono border border-zinc-700/60 flex items-center gap-1 cursor-pointer">
                <span>{selectedYear}</span>
                <span className="text-[10px] text-zinc-500">▾</span>
              </div>
            </div>

            {/* Giant Metric */}
            <div className="flex flex-col gap-1 mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
                  $186,420
                </h2>
                {/* Yellow Goal Pill matching image */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FEE500] text-black font-semibold text-xs rounded-full shadow-xs">
                  <span>▣</span>
                  <span>78% of goal</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Gross salon booking revenue closed of a $240,000 goal
              </p>
            </div>

            {/* High-Fidelity Custom Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-36 flex items-end justify-between gap-2 sm:gap-2.5 px-1 relative">
                {MONTHLY_METRICS.map((item, idx) => {
                  // Normalize height: max 33400 = 100%
                  const heightPercent = item.isCompleted 
                    ? Math.max(20, Math.round((item.revenue / 35000) * 100))
                    : 45;

                  const isCurrent = item.isCurrent;

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                      onMouseEnter={() => setHoveredMonth(item.month)}
                    >
                      {/* Floating tooltip/badge over September matching image */}
                      {isCurrent && (
                        <div className="absolute -top-7 z-10 bg-[#26262B] text-white text-[11px] font-mono px-2 py-0.5 rounded-md border border-zinc-700 shadow-md flex flex-col items-center animate-bounce-short">
                          <span>${(item.revenue / 1000).toFixed(1)}k</span>
                          <div className="w-1.5 h-1.5 bg-[#26262B] rotate-45 border-r border-b border-zinc-700 -mb-1" />
                        </div>
                      )}

                      {/* Bar body */}
                      <div className="w-full flex items-end justify-center h-28">
                        {item.isCompleted ? (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[22px] rounded-t-sm transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-[#FEE500] shadow-[0_0_12px_rgba(254,229,0,0.35)]' 
                                : 'bg-[#3A3A40] hover:bg-[#4E4E56]'
                            }`}
                          />
                        ) : (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[22px] rounded-t-sm border border-dashed border-zinc-700/80 bg-zinc-800/20"
                          />
                        )}
                      </div>

                      {/* Month label */}
                      <span className={`text-[11px] font-mono ${isCurrent ? 'text-[#FEE500] font-bold' : 'text-zinc-500'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card Summary Row */}
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-left">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500">Closed this year</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">342 cuts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500">Upcoming pipeline</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">$53.6k · 48 appts</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500">Avg ticket</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">$52 / client</span>
            </div>
          </div>
        </div>

        {/* 4 Bento Stat Cards (2x2 Grid) */}
        <div className="xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Speed to lead / Turnaround */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Avg chair turnaround</span>
              {/* Sparkline curve */}
              <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 64 32" fill="none">
                <path d="M2 6 Q 20 8, 32 18 T 62 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                34m 12s
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>38% faster</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pipeline value */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Pipeline value</span>
              {/* Sparkline curve */}
              <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 64 32" fill="none">
                <path d="M2 28 Q 18 20, 32 22 T 62 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                $18.4M
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.4%</span>
                <span className="text-slate-400 font-normal">in last 30 days</span>
              </div>
            </div>
          </div>

          {/* Card 3: Appointments this week */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Viewings & bookings</span>
              {/* Sparkline curve */}
              <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 64 32" fill="none">
                <path d="M2 24 Q 22 26, 36 12 T 62 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                24
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+4</span>
                <span className="text-slate-400 font-normal">vs last week</span>
              </div>
            </div>
          </div>

          {/* Card 4: Retention / Lead to close */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-500">Lead to rebook</span>
              {/* Sparkline curve */}
              <svg className="w-16 h-8 text-rose-500" viewBox="0 0 64 32" fill="none">
                <path d="M2 8 Q 16 10, 32 20 T 62 26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                8.6%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-0.4 pts</span>
                <span className="text-slate-400 font-normal">vs Q2</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* WALK-IN WAITLIST & DYNAMIC QUEUE */}
      <WalkInWaitlistSection />

      {/* BOTTOM ROW: Pipeline by Stage (Left) & Closing Soon (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* BOTTOM LEFT: Pipeline by Stage / Appointments by Service */}
        <div className="xl:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pipeline by stage</h3>
              <p className="text-xs text-slate-400 mt-0.5">24 open bookings · $18.4M in play</p>
            </div>
            <button 
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>Open board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Progress Bar matching image */}
          <div className="w-full flex h-2.5 rounded-full overflow-hidden gap-1 bg-slate-100 p-0.5">
            <div className="bg-slate-700 h-full rounded-full" style={{ width: '25%' }} title="Offer preparing" />
            <div className="bg-slate-500 h-full rounded-full" style={{ width: '30%' }} title="Offer submitted" />
            <div className="bg-slate-400 h-full rounded-full" style={{ width: '22%' }} title="Negotiation" />
            <div className="bg-slate-300 h-full rounded-full" style={{ width: '15%' }} title="Under contract" />
            <div className="bg-[#FEE500] h-full rounded-full" style={{ width: '8%' }} title="Closing" />
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5 font-normal">Stage</th>
                  <th className="pb-2.5 text-right font-normal">Deals</th>
                  <th className="pb-2.5 text-right font-normal">Value</th>
                  <th className="pb-2.5 text-right font-normal">Avg days</th>
                  <th className="pb-2.5 text-right font-normal">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-300" />
                    <span className="font-medium text-slate-800">Offer preparing</span>
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">4</td>
                  <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">$2.5M</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-500">4d</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">20%</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-400" />
                    <span className="font-medium text-slate-800">Offer submitted</span>
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">6</td>
                  <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">$4.5M</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-500">6d</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">40%</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-500" />
                    <span className="font-medium text-slate-800">Negotiation</span>
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">5</td>
                  <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">$4.1M</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-500">9d</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">60%</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-slate-700" />
                    <span className="font-medium text-slate-800">Under contract</span>
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">6</td>
                  <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">$5.2M</td>
                  <td className="py-3 text-right font-mono tabular-nums text-amber-600 font-semibold">18d</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">80%</td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-[#FEE500]" />
                    <span className="font-medium text-slate-800">Closing</span>
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">3</td>
                  <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">$1.6M</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-500">5d</td>
                  <td className="py-3 text-right font-mono tabular-nums font-bold text-slate-900">95%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM RIGHT: Closing Soon / Upcoming Today (Exact matching image) */}
        <div className="xl:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Closing soon</h3>
              <p className="text-xs text-slate-400 mt-0.5">5 deals · next 45 days</p>
            </div>
            <button 
              onClick={() => setActiveTab('clients')}
              className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>All deals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List of 5 Clients / Deals matching reference image */}
          <div className="flex flex-col divide-y divide-slate-100">
            
            {/* Item 1: Elena Ruiz */}
            <div 
              onClick={() => handleClientClick('client-1')}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/client_avatar_elena_1790833024834.jpg"
                  alt="Elena Ruiz"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black">
                    Elena Ruiz
                  </span>
                  <span className="text-[11px] text-slate-400">
                    3151 Coral Way, Coral Gables
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full w-[90%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">10 of 11</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs font-bold font-mono text-slate-900">$540,000</span>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FEE500] text-black text-[10px] font-bold rounded-md shadow-2xs">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Closes today</span>
                </span>
              </div>
            </div>

            {/* Item 2: Tom Whitfield */}
            <div 
              onClick={() => handleClientClick('client-2')}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/client_avatar_tom_1790833034605.jpg"
                  alt="Tom Whitfield"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black">
                    Tom Whitfield
                  </span>
                  <span className="text-[11px] text-slate-400">
                    7301 SW 57th Ct, South Miami
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full w-[82%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">9 of 11</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold font-mono text-slate-900">$612,000</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Oct 3</span>
                </span>
              </div>
            </div>

            {/* Item 3: Rafael Duarte */}
            <div 
              onClick={() => handleClientClick('client-3')}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
                  alt="Rafael Duarte"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black">
                    Rafael Duarte
                  </span>
                  <span className="text-[11px] text-slate-400">
                    2611 NE 4th Ave, Edgewater
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full w-[55%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">6 of 11</span>
                    <span className="text-[10px] text-rose-500 font-medium">· Inspection tomorrow</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold font-mono text-slate-900">$1,150,000</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Oct 21</span>
                </span>
              </div>
            </div>

            {/* Item 4: James & Mei Chen */}
            <div 
              onClick={() => handleClientClick('client-4')}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"
                  alt="James Chen"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black">
                    James & Mei Chen
                  </span>
                  <span className="text-[11px] text-slate-400">
                    1451 Brickell Ave, #3705
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full w-[64%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">7 of 11</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold font-mono text-slate-900">$880,000</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Oct 24</span>
                </span>
              </div>
            </div>

            {/* Item 5: Hannah Berg */}
            <div 
              onClick={() => handleClientClick('client-5')}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                  alt="Hannah Berg"
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black">
                    Hannah Berg
                  </span>
                  <span className="text-[11px] text-slate-400">
                    2020 N Bayshore Dr, #2408
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full w-[36%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">4 of 11</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold font-mono text-slate-900">$615,000</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Nov 8</span>
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* QUICK AUTOMATION & REMINDER ACTION STRIP */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">
              Automated Appointment Reminders are Active
            </span>
            <span className="text-xs text-slate-500">
              24-hour advance SMS and 2-hour chair-ready notifications running. 98.4% delivery rate this week.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('automations')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Configure Rules
          </button>
          <button
            onClick={() => {
              sendSimulatedReminder('apt-1', 'sms', '24-Hour Smart Advance Confirmation');
            }}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Send Next SMS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
