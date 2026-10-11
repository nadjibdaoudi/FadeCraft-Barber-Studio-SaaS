import React, { useMemo } from 'react';
import {
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Send,
  Clock
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';
import { WalkInWaitlistSection } from './WalkInWaitlistSection';
import {
  addDays,
  formatMoney,
  formatMoneyShort,
  monthlyRevenue,
  paidBetween,
  pctChange,
  revenueBetween,
  todayStr
} from '../utils/metrics';

const OPEN_STATUSES = ['scheduled', 'confirmed', 'arrived', 'in_chair'];

const STATUS_ROWS: { key: string[]; label: string; dot: string }[] = [
  { key: ['scheduled'], label: 'Scheduled', dot: 'bg-slate-300' },
  { key: ['confirmed'], label: 'Confirmed', dot: 'bg-slate-400' },
  { key: ['arrived'], label: 'Arrived', dot: 'bg-slate-500' },
  { key: ['in_chair'], label: 'In chair', dot: 'bg-slate-700' },
  { key: ['completed'], label: 'Completed', dot: 'bg-[#FEE500]' },
  { key: ['cancelled', 'no_show'], label: 'Cancelled / no-show', dot: 'bg-rose-300' }
];

const formatDay = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Small green/red delta line used by the stat cards.
const Delta: React.FC<{ pct: number | null; label: string; invert?: boolean }> = ({ pct, label, invert }) => {
  if (pct === null) {
    return <div className="text-[11px] text-slate-400">No earlier data to compare yet</div>;
  }
  const good = invert ? pct <= 0 : pct >= 0;
  return (
    <div className={`flex items-center gap-1 text-[11px] font-medium ${good ? 'text-emerald-600' : 'text-rose-500'}`}>
      {pct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      <span>
        {pct >= 0 ? '+' : ''}
        {pct.toFixed(1)}%
      </span>
      <span className="text-slate-400 font-normal">{label}</span>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const {
    setActiveTab,
    setSelectedClient,
    clients,
    appointments,
    invoices,
    reminderLogs,
    automations,
    shop,
    setRevenueGoal,
    sendSimulatedReminder
  } = useSalon();

  const now = new Date();
  const year = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const today = todayStr();

  // ---------- Yearly revenue card ----------
  const monthly = useMemo(() => monthlyRevenue(invoices, year), [invoices, year]);
  const yearRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);
  const yearCuts = monthly.reduce((sum, m) => sum + m.cuts, 0);
  const maxMonth = Math.max(...monthly.map((m) => m.revenue), 1);
  const avgTicket = yearCuts > 0 ? yearRevenue / yearCuts : 0;
  const goal = shop?.revenueGoal || 0;
  const goalPct = goal > 0 ? Math.round((yearRevenue / goal) * 100) : 0;

  const handleSetGoal = () => {
    const input = window.prompt('Set your yearly revenue goal ($)', goal > 0 ? String(goal) : '');
    if (input === null) return;
    const value = Number(input.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(value) && value > 0) setRevenueGoal(value);
  };

  // ---------- Upcoming appointments ----------
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => OPEN_STATUSES.includes(a.status) && a.date >= today)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [appointments, today]
  );
  const upcomingValue = upcoming.reduce((sum, a) => sum + a.price, 0);
  const nextAppointment = upcoming[0];

  // ---------- Stat cards ----------
  const yesterday = addDays(today, -1);
  const todayRevenue = revenueBetween(invoices, today, today);
  const yesterdayRevenue = revenueBetween(invoices, yesterday, yesterday);

  const todaysBookings = appointments.filter((a) => a.date === today && a.status !== 'cancelled');
  const todaysDone = todaysBookings.filter((a) => a.status === 'completed').length;
  const todaysRemaining = todaysBookings.filter((a) => OPEN_STATUSES.includes(a.status)).length;

  const last30 = paidBetween(invoices, addDays(today, -29), today);
  const prev30 = paidBetween(invoices, addDays(today, -59), addDays(today, -30));
  const avg = (list: typeof last30) =>
    list.length > 0 ? list.reduce((s, i) => s + i.totalAmount, 0) / list.length : 0;
  const avg30 = avg(last30);
  const avgPrev30 = avg(prev30);

  const inactiveCutoff = addDays(today, -28);
  const inactiveClients = clients.filter((c) => c.lastVisitDate && c.lastVisitDate < inactiveCutoff).length;

  // ---------- Bookings by status (today onward) ----------
  const scoped = appointments.filter((a) => a.date >= today);
  const statusStats = STATUS_ROWS.map((row) => {
    const list = scoped.filter((a) => row.key.includes(a.status));
    return {
      ...row,
      count: list.length,
      value: list.reduce((sum, a) => sum + a.price, 0)
    };
  });
  const scopedTotal = scoped.length;
  const openCount = statusStats.slice(0, 4).reduce((sum, r) => sum + r.count, 0);

  // ---------- Reminder strip ----------
  const weekStart = addDays(today, -6);
  const recentLogs = reminderLogs.filter(
    (l) => l.timestamp === 'Just now' || l.timestamp.slice(0, 10) >= weekStart
  );
  const deliveredLogs = recentLogs.filter((l) => l.status === 'delivered').length;
  const deliveryRate =
    recentLogs.length > 0 ? Math.round((deliveredLogs / recentLogs.length) * 1000) / 10 : null;
  const activeRules = automations.filter((a) => a.active).length;

  const handleClientClick = (clientId: string) => {
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setSelectedClient(found);
    } else {
      setActiveTab('bookings');
    }
  };

  return (
    <div className="p-8 max-w-[1520px] mx-auto flex flex-col gap-6">
      {/* TOP ROW: Large Dark Revenue Card + 4 Bento Stat Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

        {/* Large Dark Revenue to Goal Card */}
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
              <div className="bg-[#242428] text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-mono border border-zinc-700/60">
                <span>{year}</span>
              </div>
            </div>

            {/* Giant Metric */}
            <div className="flex flex-col gap-1 mb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
                  {formatMoney(yearRevenue)}
                </h2>
                <button
                  type="button"
                  onClick={handleSetGoal}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#FEE500] text-black font-semibold text-xs rounded-full shadow-xs"
                >
                  <span>▣</span>
                  <span>{goal > 0 ? `${goalPct}% of goal` : 'Set goal'}</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400">
                {goal > 0
                  ? `Paid revenue in ${year}, out of a ${formatMoney(goal)} goal`
                  : `Paid revenue in ${year}. Tap "Set goal" to track a yearly target.`}
              </p>
            </div>

            {/* Monthly bar chart */}
            <div className="pt-6 pb-2">
              <div className="h-36 flex items-end justify-between gap-2 sm:gap-2.5 px-1 relative">
                {monthly.map((item) => {
                  const isCurrent = item.monthIndex === currentMonthIdx;
                  const isFuture = item.monthIndex > currentMonthIdx;
                  const heightPercent = Math.max(4, Math.round((item.revenue / maxMonth) * 100));

                  return (
                    <div
                      key={item.monthIndex}
                      title={`${item.name}: ${formatMoney(item.revenue)}`}
                      className="flex-1 flex flex-col items-center gap-2 group relative"
                    >
                      {isCurrent && (
                        <div className="absolute -top-7 z-10 bg-[#26262B] text-white text-[11px] font-mono px-2 py-0.5 rounded-md border border-zinc-700 shadow-md flex flex-col items-center">
                          <span>{formatMoneyShort(item.revenue)}</span>
                          <div className="w-1.5 h-1.5 bg-[#26262B] rotate-45 border-r border-b border-zinc-700 -mb-1" />
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center h-28">
                        {isFuture ? (
                          <div
                            style={{ height: '18%' }}
                            className="w-full max-w-[22px] rounded-t-sm border border-dashed border-zinc-700/80 bg-zinc-800/20"
                          />
                        ) : (
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[22px] rounded-t-sm transition-all duration-300 ${
                              isCurrent
                                ? 'bg-[#FEE500] shadow-[0_0_12px_rgba(254,229,0,0.35)]'
                                : 'bg-[#3A3A40] hover:bg-[#4E4E56]'
                            }`}
                          />
                        )}
                      </div>

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
              <span className="text-[11px] text-zinc-500">Paid this year</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                {yearCuts} {yearCuts === 1 ? 'visit' : 'visits'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500">Upcoming pipeline</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                {formatMoney(upcomingValue)} · {upcoming.length} appts
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500">Avg ticket</span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                {yearCuts > 0 ? `${formatMoney(avgTicket)} / client` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Bento Stat Cards (2x2 Grid) */}
        <div className="xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Card 1: Today's revenue */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <span className="text-xs font-medium text-slate-500">Today's revenue</span>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                {formatMoney(todayRevenue)}
              </div>
              <Delta pct={pctChange(todayRevenue, yesterdayRevenue)} label="vs yesterday" />
            </div>
          </div>

          {/* Card 2: Today's bookings */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <span className="text-xs font-medium text-slate-500">Today's bookings</span>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                {todaysBookings.length}
              </div>
              <div className="text-[11px] text-slate-400">
                {todaysDone} completed · {todaysRemaining} remaining
              </div>
            </div>
          </div>

          {/* Card 3: Average ticket (30 days) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <span className="text-xs font-medium text-slate-500">Avg ticket · last 30 days</span>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                {last30.length > 0 ? formatMoney(avg30) : '—'}
              </div>
              <Delta pct={pctChange(avg30, avgPrev30)} label="vs previous 30 days" />
            </div>
          </div>

          {/* Card 4: Inactive clients */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <span className="text-xs font-medium text-slate-500">Clients away 28+ days</span>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-900 tracking-tight">
                {inactiveClients}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('clients')}
                className="text-left text-[11px] text-slate-400 hover:text-slate-700"
              >
                Win-back candidates · open clients
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* WALK-IN WAITLIST & DYNAMIC QUEUE */}
      <WalkInWaitlistSection />

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* BOTTOM LEFT: Bookings by status */}
        <div className="xl:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bookings by status</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {openCount} open bookings · {formatMoney(upcomingValue)} in play · today onward
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>Open board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented bar */}
          <div className="w-full flex h-2.5 rounded-full overflow-hidden gap-1 bg-slate-100 p-0.5">
            {scopedTotal > 0 &&
              statusStats
                .filter((r) => r.count > 0)
                .map((r) => (
                  <div
                    key={r.label}
                    className={`${r.dot} h-full rounded-full`}
                    style={{ width: `${(r.count / scopedTotal) * 100}%` }}
                    title={r.label}
                  />
                ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 text-right font-normal">Bookings</th>
                  <th className="pb-2.5 text-right font-normal">Value</th>
                  <th className="pb-2.5 text-right font-normal">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statusStats.map((r) => (
                  <tr key={r.label} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-xs ${r.dot}`} />
                      <span className="font-medium text-slate-800">{r.label}</span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-700">{r.count}</td>
                    <td className="py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatMoney(r.value)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-500">
                      {scopedTotal > 0 ? `${Math.round((r.count / scopedTotal) * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM RIGHT: Upcoming appointments */}
        <div className="xl:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming appointments</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {upcoming.length} open · showing the next {Math.min(5, upcoming.length)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>All bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No upcoming appointments. New bookings will appear here.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {upcoming.slice(0, 5).map((apt) => {
                const isToday = apt.date === today;
                return (
                  <div
                    key={apt.id}
                    onClick={() => handleClientClick(apt.clientId)}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={apt.clientAvatar}
                        alt={apt.clientName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-black truncate">
                          {apt.clientName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {apt.serviceName} · {apt.barberName || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-900">{formatMoney(apt.price)}</span>
                      {isToday ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#FEE500] text-black text-[10px] font-bold rounded-md shadow-2xs">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Today · {apt.time}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {formatDay(apt.date)} · {apt.time}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              {activeRules > 0
                ? `${activeRules} automated reminder ${activeRules === 1 ? 'rule is' : 'rules are'} active`
                : 'Automated reminders are paused'}
            </span>
            <span className="text-xs text-slate-500">
              {deliveryRate !== null
                ? `${deliveryRate}% delivery rate across ${recentLogs.length} messages in the last 7 days.`
                : 'No reminders sent in the last 7 days.'}
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
            disabled={!nextAppointment}
            onClick={() => {
              if (!nextAppointment) return;
              const rule = automations.find((a) => a.active) || automations[0];
              sendSimulatedReminder(nextAppointment.id, 'sms', rule ? rule.title : 'Manual reminder');
            }}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test Send Next SMS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
